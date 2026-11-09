const { ContainerBuilder, TextDisplayBuilder, MessageFlags, PermissionFlagsBits } = require("discord.js");
const WINDOW = 8_000;
const MAX_MESSAGES = 5;
const TIMEOUT_DURATION = 60_000;
module.exports = {
  name: "antiRaid",
  description: "Détecte les rafales de messages et restreint l'auteur",
  run: async (client, message) => {
    if (!message.guild || !message.member || message.author.bot) return;
    const key = `${message.guild.id}:${message.author.id}`;
    const now = Date.now();
    const history = (client.raidFilter.get(key) || []).filter((t) => now - t < WINDOW);
    history.push(now);
    client.raidFilter.set(key, history);
    if (history.length < MAX_MESSAGES) return;
    client.raidFilter.delete(key);
    const me = message.guild.members.me;
    const canDelete = message.channel.permissionsFor(me)?.has(PermissionFlagsBits.ManageMessages);
    const canTimeout = message.channel.permissionsFor(me)?.has(PermissionFlagsBits.ModerateMembers);
    if (canDelete) {
      await message.delete().catch(() => {});
    }
    if (canTimeout) {
      await message.member
        .timeout(TIMEOUT_DURATION, "Rafale de messages détectée (anti-raid)")
        .catch(() => {});
    }
    const container = new ContainerBuilder()
      .setAccentColor(0xff0000)
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`${message.author} a été restreint 60 s : rafale de messages détectée.`,));
    await message.channel
      .send({ components: [container], flags: MessageFlags.IsComponentsV2 })
      .catch(() => {});
  },
};