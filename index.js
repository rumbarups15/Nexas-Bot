"use strict";
const fs = require("fs");
const path = require("path");
const Discord = require("discord.js");
const {
  Events,
  GatewayIntentBits,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  ActivityType,
  AuditLogEvent,
} = Discord;
const config = require("./config.json");
const DB_PATH = process.env.BOT_PUBLIC_DB || path.join(__dirname, "db.json");
function emptyDb() {
  return { servers: {}, users: {}, tickets: {} };
}
function loadDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const initial = emptyDb();
      fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
      console.log(`[db] Création automatique de ${path.basename(DB_PATH)}`);
      return initial;
    }
    const parsed = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    const db = emptyDb();
    for (const key of Object.keys(db)) {
      if (parsed[key] && typeof parsed[key] === "object" && !Array.isArray(parsed[key])) {
        db[key] = parsed[key];
      }
    }
    return db;
  } catch (error) {
    console.warn(`[db] db.json illisible (${error.message}) — démarrage avec une base vide.`);
    return emptyDb();
  }
}
const store = loadDb();
let saveTimer = null;
function scheduleSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    saveNow();
  }, 300);
}
function saveNow() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(store, null, 2));
    return true;
  } catch (error) {
    console.error(`[db] Impossible d'écrire db.json : ${error.message}`);
    return false;
  }
}
function matches(record, query) {
  return Object.entries(query).every(([key, value]) => {
    const current = record[key];
    if (current === value) return true;
    if (current === null || current === undefined || value === null || value === undefined) {
      return current === value;
    }
    return String(current) === String(value);
  });
}
function sortRows(rows, sortObj) {
  if (!sortObj) return rows;
  const entries = Object.entries(sortObj).filter(([field]) => Boolean(field));
  if (!entries.length) return rows;
  return rows.sort((a, b) => {
    for (const [field, dir] of entries) {
      const left = a[field];
      const right = b[field];
      if (left === right) continue;
      let result;
      if (typeof left === "number" && typeof right === "number") result = left - right;
      else result = String(left ?? "").localeCompare(String(right ?? ""));
      return dir === -1 ? -result : result;
    }
    return 0;
  });
}
function defineModel(table, columns, options = {}) {
  const jsonFields = options.jsonFields || [];
  const defaults = options.defaults || {};
  function resolveDefault(col) {
    if (!(col in defaults)) return jsonFields.includes(col) ? [] : null;
    const value = defaults[col];
    return typeof value === "function" ? value() : value;
  }
  function toInstance(record) {
    if (!record) return null;
    const instance = Object.create(Model.prototype);
    instance.__isNew = false;
    for (const col of columns) {
      let value = record[col];
      if (jsonFields.includes(col)) {
        if (typeof value === "string") {
          try {
            value = JSON.parse(value);
          } catch {
            value = [];
          }
        }
        if (!Array.isArray(value)) value = [];
        else value = value.slice();
      } else if (value === undefined) {
        value = resolveDefault(col);
      }
      instance[col] = value;
    }
    return instance;
  }
  function serialize(instance, col) {
    let value = instance[col];
    if (value === undefined) value = resolveDefault(col);
    if (jsonFields.includes(col)) value = JSON.stringify(Array.isArray(value) ? value : []);
    else if (value instanceof Date) value = value.toISOString();
    return value === undefined ? null : value;
  }
  class Model {
    constructor(data = {}) {
      this.__isNew = true;
      for (const col of columns) {
        this[col] = data[col] !== undefined ? data[col] : resolveDefault(col);
      }
    }
    async save() {
      if (this.id === undefined || this.id === null) {
        throw new Error(`[${table}] enregistrement sans identifiant`);
      }
      if (!store[table]) store[table] = {};
      const record = {};
      for (const col of columns) record[col] = serialize(this, col);
      store[table][String(this.id)] = record;
      this.__isNew = false;
      scheduleSave();
      return this;
    }
    static async findOne(query = {}) {
      const rows = Object.values(store[table] || {}).filter((record) => matches(record, query));
      return toInstance(rows[0]);
    }
    static find(query = {}) {
      return new QueryBuilder(table, query);
    }
  }
  class QueryBuilder {
    constructor(targetTable, targetQuery) {
      this.table = targetTable;
      this.query = targetQuery || {};
      this.sortSpec = null;
      this.limitCount = null;
    }
    sort(sortObj) {
      this.sortSpec = sortObj;
      return this;
    }
    limit(count) {
      this.limitCount = Number(count) || 0;
      return this;
    }
    then(resolve, reject) {
      try {
        let rows = Object.values(store[this.table] || {}).filter((record) =>
          matches(record, this.query),
        );
        rows = sortRows(rows, this.sortSpec);
        if (this.limitCount) rows = rows.slice(0, this.limitCount);
        resolve(rows.map(toInstance));
      } catch (error) {
        if (reject) reject(error);
        else throw error;
      }
    }
  }
  return Model;
}
const User = defineModel(
  "users",
  [
    "id",
    "username",
    "discriminator",
    "xp",
    "level",
    "balance",
    "inventory",
    "warnings",
    "lastDaily",
    "joinedAt",
  ],
  {
    jsonFields: ["inventory"],
    defaults: {
      xp: 0,
      level: 1,
      balance: 0,
      warnings: 0,
      joinedAt: () => new Date().toISOString(),
    },
  },
);
const Server = defineModel(
  "servers",
  [
    "id",
    "prefix",
    "autoRole",
    "logChannel",
    "welcomeChannel",
    "welcomeMessage",
    "leaveChannel",
    "leaveMessage",
  ],
  { defaults: { prefix: "!" } },
);
const Ticket = defineModel(
  "tickets",
  ["id", "userId", "channelId", "categoryId", "status", "transcript", "createdAt", "closedAt"],
  {
    jsonFields: ["transcript"],
    defaults: { status: "open", createdAt: () => new Date().toISOString() },
  },
);
const client = new Discord.Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
  ],
  allowedMentions: { parse: ["users"], repliedUser: false },
});

client.db = store;
client.models = { User, Server, Ticket };
client.commands = new Map();
client.aliases = new Map();
client.automod = [];
client.cooldowns = new Map();
client.spamFilter = new Map();
client.raidFilter = new Map();
client.xpCooldown = new Map();
const COMMANDS_PATH = path.join(__dirname, "commands");
const AUTOMOD_FOLDER = "automoderation";
function registerCommand(command, source) {
  if (!command || typeof command.run !== "function") {
    console.warn(`[commandes] ${source} ignoré : "run" manquant.`);
    return;
  }
  const name = String(command.name || path.basename(source, ".js")).toLowerCase();
  command.name = name;
  command.category = command.category || path.dirname(source).replace(/\\/g, "/") || "Général";
  client.commands.set(name, command);
  if (Array.isArray(command.aliases)) {
    for (const alias of command.aliases) client.aliases.set(String(alias).toLowerCase(), name);
  }
}
function loadFromFolder(folder, handler) {
  const dir = path.join(COMMANDS_PATH, folder);
  if (!fs.existsSync(dir)) return;
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".js")) continue;
    const relative = `${folder}/${file}`;
    let loaded;
    try {
      loaded = require(path.join(dir, file));
    } catch (error) {
      console.error(`[commandes] Impossible de charger ${relative} :`, error);
      continue;
    }
    const list = Array.isArray(loaded)
      ? loaded
      : loaded && Array.isArray(loaded.commands)
        ? loaded.commands
        : [loaded];
    for (const item of list) handler(item, relative, file);
  }
}
for (const folder of fs.readdirSync(COMMANDS_PATH)) {
  if (folder === AUTOMOD_FOLDER) continue;
  loadFromFolder(folder, (command, relative) => registerCommand(command, relative));
}
loadFromFolder(AUTOMOD_FOLDER, (hook, relative, file) => {
  if (!hook || typeof hook.run !== "function") {
    console.warn(`[automod] ${relative} ignoré : "run" manquant.`);
    return;
  }
  hook.name = hook.name || path.basename(file, ".js");
  client.automod.push(hook);
});
client.automod.push({
  name: "antiSpam",
  run: async (cli, message) => {
    const key = `${message.guild.id}:${message.author.id}`;
    const now = Date.now();
    const history = (cli.spamFilter.get(key) || []).filter((t) => now - t < 5000);
    history.push(now);
    cli.spamFilter.set(key, history);
    if (history.length <= 5) return;
    cli.spamFilter.delete(key);
    await message.delete().catch(() => {});
    await message.member.timeout(60_000, "Anti-spam").catch(() => {});
    const container = new ContainerBuilder()
      .setAccentColor(0xff0000)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${message.author} a été restreint 60 s : message répété trop rapidement.`,
        ),
      );
    await message.channel
      .send({ components: [container], flags: MessageFlags.IsComponentsV2 })
      .catch(() => {});
  },
});
const CATEGORIES_LABELS = {
  moderation: "Modération",
  automoderation: "Protection automatique",
  tickets: "Tickets",
  levelSystem: "Niveaux",
  economy: "Économie",
  welcomeSystem: "Bienvenue / Adieu",
  logging: "Journalisation",
  security: "Sécurité",
  utility: "Utilitaires",
  Général: "Général",
};
function categoryLabel(category) {
  return CATEGORIES_LABELS[category] || category || "Général";
}
function renderTemplate(text, context) {
  return String(text)
    .replace(/\{user\}/g, context.user)
    .replace(/\{mention\}/g, context.user)
    .replace(/\{server\}/g, context.guild.name)
    .replace(/\{count\}/g, String(context.guild.memberCount));
}
async function getServer(guildId) {
  return Server.findOne({ id: guildId });
}
async function sendLog(guild, { title, description, color = 0x5865f2, footer }) {
  const short = String(description || "").replace(/\s+/g, " ").slice(0, 200);
  console.log(`[journal][${guild ? guild.name : "DM"}] ${title} — ${short}`);
  if (!guild) return;
  const server = await getServer(guild.id);
  const channelId = server && server.logChannel;
  if (!channelId) return;
  const channel = guild.channels.cache.get(String(channelId));
  if (!channel || !channel.isTextBased()) return;
  const embed = new EmbedBuilder().setColor(color).setTitle(title).setTimestamp();
  if (description) embed.setDescription(description);
  if (footer) embed.setFooter({ text: footer });
  await channel.send({ embeds: [embed] }).catch((error) => {
    console.warn(`[journal] envoi impossible : ${error.message}`);
  });
}
function buildCard({ color = 0x00ff00, blocks = [], footer }) {
  const container = new ContainerBuilder().setAccentColor(color);
  for (const block of blocks) {
    if (!block) continue;
    if (block.separator) {
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(block.spacing || SeparatorSpacingSize.Small),
      );
      continue;
    }
    if (block.text) {
      container.addTextDisplayComponents(new TextDisplayBuilder().setContent(block.text));
    }
  }
  if (footer) {
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# ${footer}`));
  }
  return container;
}
async function replyCard(message, payload) {
  return message.reply({ components: [payload], flags: MessageFlags.IsComponentsV2 });
}
function isStaff(member) {
  if (!member) return false;
  const perms = member.permissions;
  return (
    perms.has(PermissionFlagsBits.Administrator) ||
    perms.has(PermissionFlagsBits.ManageMessages) ||
    perms.has(PermissionFlagsBits.ManageGuild)
  );
}
async function runAutomod(message) {
  if (!message.guild || !message.member || message.author.bot) return;
  if (isStaff(message.member)) return;
  for (const hook of client.automod) {
    try {
      await hook.run(client, message);
    } catch (error) {
      console.error(`[automod] ${hook.name} :`, error.message);
    }
    if (message.deleted) return;
  }
}
function findTicketRecord(channelId) {
  const records = Object.entries(store.tickets || {});
  for (const [key, record] of records) {
    if (String(record.channelId) === String(channelId) || String(key) === String(channelId)) {
      return record;
    }
  }
  return null;
}
function recordTranscript(message) {
  const record = findTicketRecord(message.channel.id);
  if (!record) return;
  let transcript;
  try {
    transcript = typeof record.transcript === "string" ? JSON.parse(record.transcript) : [];
  } catch {
    transcript = [];
  }
  if (!Array.isArray(transcript)) transcript = [];
  if (transcript.length >= 250) transcript.shift();
  transcript.push({
    author: message.author.tag,
    authorId: message.author.id,
    content: String(message.content || "").slice(0, 500),
    at: new Date().toISOString(),
  });
  record.transcript = JSON.stringify(transcript);
  scheduleSave();
}
const XP_MIN = 10;
const XP_MAX = 25;
const XP_DELAY = 60_000;
async function grantXp(message) {
  const key = `${message.guild.id}:${message.author.id}`;
  const now = Date.now();
  const last = client.xpCooldown.get(key) || 0;
  if (now - last < XP_DELAY) return;
  client.xpCooldown.set(key, now);
  let user = await User.findOne({ id: message.author.id });
  if (!user) {
    user = new User({
      id: message.author.id,
      username: message.author.username,
      discriminator: message.author.discriminator,
    });
  }
  user.xp = Number(user.xp) || 0;
  user.level = Number(user.level) || 1;
  user.xp += Math.floor(Math.random() * (XP_MAX - XP_MIN + 1)) + XP_MIN;
  const needed = user.level * 100;
  const leveledUp = user.xp >= needed;
  if (leveledUp) user.xp -= needed;
  if (leveledUp) user.level += 1;
  await user.save();
  if (leveledUp) {
    const container = buildCard({
      color: 0xffd700,
      blocks: [
        { text: `## Niveau supérieur !` },
        { text: `${message.author} passe au **niveau ${user.level}** !` },
      ],
      footer: `${message.author.tag} • ${new Date().toLocaleString("fr-FR")}`,
    });
    await message.channel
      .send({ components: [container], flags: MessageFlags.IsComponentsV2 })
      .catch(() => {});
  }
}
const DEFAULT_WELCOME = "## Bienvenue sur {server} !\nBienvenue {user} nous sommes maintenant **{count}** membres.";
const DEFAULT_LEAVE = "## Au revoir !\n{user} a quitté **{server}**. Nous sommes désormais **{count}** membres.";
async function applyAutoRole(member) {
  const server = await getServer(member.guild.id);
  const roleId = (server && server.autoRole) || config.autoRole;
  if (!roleId) return;
  const role = member.guild.roles.cache.get(String(roleId));
  if (!role) return;
  if (member.roles.cache.has(role.id)) return;
  await member.roles.add(role, "Autorole automatique").catch((error) => {
    console.warn(`[autorole] impossible d'attribuer le rôle : ${error.message}`);
  });
}
async function sendFarewellCard(member, { isWelcome }) {
  const server = await getServer(member.guild.id);
  const channelId = isWelcome
    ? server && server.welcomeChannel
    : server && server.leaveChannel;
  if (!channelId) return;
  const channel = member.guild.channels.cache.get(String(channelId));
  if (!channel || !channel.isTextBased()) return;
  const custom = isWelcome
    ? server.welcomeMessage || ""
    : server.leaveMessage || "";
  const context = { user: `${member}`, guild: member.guild };
  const text = custom
    ? renderTemplate(custom, context)
    : renderTemplate(isWelcome ? DEFAULT_WELCOME : DEFAULT_LEAVE, context);
  const container = buildCard({
    color: isWelcome ? 0x00ff00 : 0xff0000,
    blocks: [
      {
        text: isWelcome
          ? `## Bienvenue ${member} !`
          : `## Au revoir ${member.user.tag} !`,
      },
      { text },
      { separator: true },
      {
        text: isWelcome
          ? `**Compte créé le :** ${new Date(member.user.createdAt).toLocaleDateString("fr-FR")}`
          : `**Départ le :** ${new Date().toLocaleString("fr-FR")}`,
      },
    ],
    footer: `${member.guild.name} • ${member.guild.memberCount} membres`,
  });
  await channel
    .send({ components: [container], flags: MessageFlags.IsComponentsV2 })
    .catch((error) => console.warn(`[bienvenue] envoi impossible : ${error.message}`));
}
function permissionFlags(list) {
  if (!Array.isArray(list)) return [];
  return list.map((name) => PermissionFlagsBits[name]).filter(Boolean);
}
function canRun(command, message) {
  const required = permissionFlags(command.permissions);
  if (!required.length) return true;
  const member = message.member;
  if (!member) return false;
  if (member.permissions.has(required)) return true;
  message
    .reply("Vous n'avez pas la permission d'utiliser cette commande.")
    .catch(() => {});
  return false;
}
function applyCooldown(command, message) {
  const cooldown = typeof command.cooldown === "number" ? command.cooldown : 2000;
  if (cooldown <= 0) return true;
  const key = `${command.name}:${message.author.id}`;
  const now = Date.now();
  const until = client.cooldowns.get(key) || 0;
  if (until > now) {
    const remaining = Math.ceil((until - now) / 1000);
    if (remaining >= 1) {
      message
        .reply(`Patientez **${remaining} seconde(s)** avant de réutiliser \`${command.name}\`.`)
        .catch(() => {});
    }
    return false;
  }
  client.cooldowns.set(key, now + cooldown);
  return true;
}
client.on(Events.MessageCreate, async (message) => {
  if (!message.guild) return;
  if (message.author.bot) return;
  try {
    await runAutomod(message);
  } catch (error) {
    console.error("[automod] erreur :", error);
  }
  if (message.deleted) return;
  try {
    recordTranscript(message);
  } catch (error) {
    console.error("[tickets] transcript :", error.message);
  }
  try {
    await grantXp(message);
  } catch (error) {
    console.error("[niveaux] erreur :", error.message);
  }
  if (typeof message.content !== "string" || !message.content) return;
  const server = await getServer(message.guild.id);
  const prefix = (server && server.prefix) || config.prefix || "!";
  if (!message.content.startsWith(prefix)) return;
  const args = message.content.slice(prefix.length).trim().split(/\s+/).filter(Boolean);
  const invoked = (args.shift() || "").toLowerCase();
  if (!invoked) return;
  const resolved = client.commands.has(invoked) ? invoked : client.aliases.get(invoked);
  const command = resolved ? client.commands.get(resolved) : undefined;
  if (!command) {
    console.log(`[commande] inconnue : ${prefix}${invoked}`);
    return;
  }
  if (!canRun(command, message)) return;
  if (!applyCooldown(command, message)) return;
  try {
    await command.run(client, message, args, { prefix, server });
  } catch (error) {
    console.error(`[commande] ${command.name} :`, error);
    await message
      .reply("Une erreur est survenue lors de l'exécution de la commande. Veuillez réessayer.")
      .catch(() => {});
  }
});
client.on(Events.GuildMemberAdd, async (member) => {
  try {
    await applyAutoRole(member);
    await sendFarewellCard(member, { isWelcome: true });
    await sendLog(member.guild, {
      title: "Membre rejoint",
      description: `${member} ${member.guild.memberCount} membres.`,
      color: 0x00ff00,
    });
  } catch (error) {
    console.error("[membre] arrivée :", error.message);
  }
});
client.on(Events.GuildMemberRemove, async (member) => {
  try {
    await sendFarewellCard(member, { isWelcome: false });
    const server = await getServer(member.guild.id);
    const hasLog = Boolean(server && server.logChannel);
    let kicker = null;
    if (hasLog) {
      try {
        const entries = await member.guild.fetchAuditLogs({
          type: AuditLogEvent.MemberKick,
          limit: 5,
        });
        const entry = entries.entries.find(
          (e) =>
            e.target &&
            e.target.id === member.id &&
            Date.now() - e.createdTimestamp < 10_000,
        );
        if (entry) kicker = entry.executor;
      } catch {
        kicker = null;
      }
    }
    await sendLog(member.guild, {
      title: kicker ? "Membre expulsé" : "Membre parti",
      description: kicker
        ? `${member.user.tag} a été expulsé par ${kicker.tag}.`
        : `${member.user.tag} a quitté le serveur — ${member.guild.memberCount} membres.`,
      color: kicker ? 0xffa500 : 0xff0000,
    });
  } catch (error) {
    console.error("[membre] départ :", error.message);
  }
});
client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  try {
    const oldTimeout = oldMember.communicationDisabledUntilTimestamp || 0;
    const newTimeout = newMember.communicationDisabledUntilTimestamp || 0;
    if (!oldTimeout && newTimeout) {
      await sendLog(newMember.guild, {
        title: "Membre restrict",
        description: `${newMember.user.tag} a été restrict jusqu'au ${new Date(newTimeout).toLocaleString("fr-FR")}.`,
        color: 0xffa500,
      });
      return;
    }
    if (oldTimeout && !newTimeout) {
      await sendLog(newMember.guild, {
        title: "Restriction levée",
        description: `La restriction de ${newMember.user.tag} a été levée.`,
        color: 0x00ff00,
      });
      return;
    }
    const added = newMember.roles.cache.filter((r) => !oldMember.roles.cache.has(r.id));
    const removed = oldMember.roles.cache.filter((r) => !newMember.roles.cache.has(r.id));
    if (added.size || removed.size) {
      const parts = [];
      if (added.size) parts.push(`Ajout : ${added.map((r) => r.toString()).join(", ")}`);
      if (removed.size) parts.push(`Retrait : ${removed.map((r) => r.toString()).join(", ")}`);
      await sendLog(newMember.guild, {
        title: "Rôles modifiés",
        description: `${newMember.user.tag} — ${parts.join(" • ")}`,
        color: 0x5865f2,
      });
    }
  } catch (error) {
    console.error("[membre] mise à jour :", error.message);
  }
});
client.on(Events.GuildBanAdd, async (ban) => {
  await sendLog(ban.guild, {
    title: "Bannissement",
    description: `${ban.user.tag} (\`${ban.user.id}\`) a été banni.\nRaison : ${ban.reason || "Aucune raison"}`,
    color: 0xff0000,
  }).catch((error) => console.error("[journal] ban :", error.message));
});
client.on(Events.GuildBanRemove, async (ban) => {
  await sendLog(ban.guild, {
    title: "Débannissement",
    description: `${ban.user.tag} (\`${ban.user.id}\`) a été débanni.`,
    color: 0x00ff00,
  }).catch((error) => console.error("[journal] unban :", error.message));
});
client.on(Events.MessageDelete, async (message) => {
  try {
    if (!message.guild || (message.author && message.author.bot)) return;
    const preview = message.content
      ? String(message.content).slice(0, 300)
      : "*message sans texte ou pièce jointe*";
    await sendLog(message.guild, {
      title: "Message supprimé",
      description: `**Auteur :** ${message.author ? message.author.tag : "Inconnu"}\n**Salon :** ${message.channel}\n**Contenu :** ${preview}`,
      color: 0xff0000,
    });
  } catch (error) {
    console.error("[journal] message supprimé :", error.message);
  }
});
client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
  try {
    if (!newMessage.guild || (newMessage.author && newMessage.author.bot)) return;
    if (oldMessage.content === newMessage.content) return;
    const before = oldMessage.content ? String(oldMessage.content).slice(0, 250) : "*vide*";
    const after = newMessage.content ? String(newMessage.content).slice(0, 250) : "*vide*";
    await sendLog(newMessage.guild, {
      title: "Message modifié",
      description: `**Auteur :** ${newMessage.author ? newMessage.author.tag : "Inconnu"}\n**Salon :** ${newMessage.channel}\n**Avant :** ${before}\n**Après :** ${after}`,
      color: 0xf1c40f,
    });
  } catch (error) {
    console.error("[journal] message modifié :", error.message);
  }
});
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  try {
    const member = newState.member || oldState.member;
    if (!member || member.user.bot) return;
    const guild = newState.guild;
    const before = oldState.channel;
    const after = newState.channel;
    let title = "Mise à jour vocale";
    let description = `${member.user.tag}`;
    let color = 0x5865f2;
    if (!before && after) {
      title = "Connexion vocale";
      description = `${member.user.tag} a rejoint **${after.name}**.`;
      color = 0x00ff00;
    } else if (before && !after) {
      title = "Déconnexion vocale";
      description = `${member.user.tag} a quitté **${before.name}**.`;
      color = 0xff0000;
    } else if (before && after && before.id !== after.id) {
      title = "Déplacement vocal";
      description = `${member.user.tag} est passé de **${before.name}** vers **${after.name}**.`;
      color = 0xf1c40f;
    } else {
      return;
    }
    await sendLog(guild, { title, description, color });
  } catch (error) {
    console.error("[journal] vocal :", error.message);
  }
});
client.on(Events.ChannelCreate, async (channel) => {
  if (!channel.guild) return;
  await sendLog(channel.guild, {
    title: "Salon créé",
    description: `${channel} type \`${channel.type}\``,
    color: 0x00ff00,
  }).catch((error) => console.error("[journal] salon créé :", error.message));
});
client.on(Events.ChannelDelete, async (channel) => {
  if (!channel.guild) return;
  try {
    const record = findTicketRecord(channel.id);
    if (record) {
      delete store.tickets[String(channel.id)];
      for (const key of Object.keys(store.tickets || {})) {
        if (String(store.tickets[key].channelId) === String(channel.id)) {
          delete store.tickets[key];
        }
      }
      scheduleSave();
    }
    await sendLog(channel.guild, {
      title: "Salon supprimé",
      description: `${channel.name ? `#${channel.name}` : channel.id}${record ? " (ticket fermé)" : ""}`,
      color: 0xff0000,
    });
  } catch (error) {
    console.error("[journal] salon supprimé :", error.message);
  }
});
client.on(Events.ChannelUpdate, async (oldChannel, newChannel) => {
  if (!newChannel.guild) return;
  if (oldChannel.name === newChannel.name && oldChannel.topic === newChannel.topic) return;
  await sendLog(newChannel.guild, {
    title: "Salon modifié",
    description: `**Avant :** ${oldChannel.name}\n**Après :** ${newChannel.name}`,
    color: 0xf1c40f,
  }).catch((error) => console.error("[journal] salon modifié :", error.message));
});
client.once(Events.ClientReady, () => {
  console.log(`Le bot ${client.user.tag} fonctionne correctement !`);
  console.log(`En ligne sur ${client.guilds.cache.size} serveur(s)`);
  client.user
    .setPresence({
      activities: [{ name: `${config.prefix}help`, type: ActivityType.Listening }],
      status: "online",
    })
    .catch(() => {});
});
setInterval(() => {
  const now = Date.now();
  for (const [key, history] of client.spamFilter) {
    const recent = Array.isArray(history)
      ? history.filter((t) => now - t < 10_000)
      : history;
    if (Array.isArray(recent) && recent.length === 0) client.spamFilter.delete(key);
    else if (Array.isArray(recent)) client.spamFilter.set(key, recent);
  }
  for (const [key, timestamps] of client.raidFilter) {
    const recent = Array.isArray(timestamps)
      ? timestamps.filter((t) => now - t < 10_000)
      : [];
    if (recent.length === 0) client.raidFilter.delete(key);
    else client.raidFilter.set(key, recent);
  }
  for (const [key, timestamp] of client.xpCooldown) {
    if (now - timestamp > 10 * 60_000) client.xpCooldown.delete(key);
  }
  for (const [key, until] of client.cooldowns) {
    if (until < now) client.cooldowns.delete(key);
  }
}, 60_000).unref();
client.commands.set("prefix", {
  name: "prefix",
  category: "Général",
  description: "Affiche ou modifie le préfixe du serveur",
  usage: "!prefix [nouveauPréfixe]",
  aliases: ["setprefix"],
  permissions: ["ManageGuild"],
  cooldown: 3000,
  run: async (cli, message, args, context) => {
    const current = (context && context.server && context.server.prefix) || config.prefix || "!";
    if (!args[0]) {
      const container = buildCard({
        color: 0x00ff00,
        blocks: [{ text: "Préfixe du serveur" }, { text: `Préfixe actuel : \`${current}\`` }],
        footer: `Changez-le avec \`${current}prefix <nouveau>\``,
      });
      return replyCard(message, container);
    }
    const next = args[0].slice(0, 5);
    let server = context && context.server;
    if (!server) server = await getServer(message.guild.id);
    if (!server) server = new Server({ id: message.guild.id });
    server.prefix = next;
    await server.save();
    const container = buildCard({
      color: 0x00ff00,
      blocks: [{ text: "Préfixe modifié" }, { text: `Nouveau préfixe : \`${next}\`` }],
      footer: message.author.tag,
    });
    return replyCard(message, container);
  },
});
console.log(`[commandes] ${client.commands.size} commande(s) — ${client.automod.length} protection(s) automatique(s)`);
let loginAttempts = 0;
async function start() {
  loginAttempts += 1;
  try {
    await client.login(config.token);
    loginAttempts = 0;
  } catch (error) {
    const first = loginAttempts === 1;
    if (first) {
      console.error("Échec de la connexion :", error.message);
      console.error(
        "[bot] Token refusé par Discord : le bot reste démarré et réessaiera toutes les 60 s. " +
          "Mettez à jour config.json > token pour connecter le bot.",
      );
    } else {
      console.log(`[bot] nouvelle tentative de connexion échouée (${error.message}).`);
    }
    setTimeout(start, 60_000);
  }
}
start();
process.on("unhandledRejection", (error) => {
  console.error("Erreur non gérée :", error);
});
process.on("uncaughtException", (error) => {
  console.error("Exception non interceptée :", error);
});
function shutdown(signal) {
  console.log(`\n[bot] Arrêt (${signal}) — écriture de db.json`);
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  saveNow();
  process.exit(0);
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("exit", () => {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
    saveNow();
  }
});
module.exports = {
  client,
  models: { User, Server, Ticket },
  store,
  saveNow,
  helpers: {
    buildCard,
    sendLog,
    grantXp,
    runAutomod,
    recordTranscript,
    applyAutoRole,
    sendFarewellCard,
    renderTemplate,
    getServer,
  },
};