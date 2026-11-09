const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
const CATEGORY_ORDER = [
  "Général",
  "Modération",
  "Protection automatique",
  "Tickets",
  "Niveaux",
  "Économie",
  "Bienvenue / Adieu",
  "Journalisation",
  "Sécurité",
  "Utilitaires",
];
module.exports = {
  name: "help",
  description: "Affiche la liste des commandes disponibles",
  usage: "!help",
  aliases: ["aide", "commands"],
  cooldown: 3000,
  run: async (client, message, args, context) => {
    try {
      const prefix = (context && context.prefix) || "!";
      const groups = new Map();
      for (const command of client.commands.values()) {
        const label =
          CATEGORY_ORDER.find((c) => c === command.category) ||
          command.category ||
          "Général";
        if (!groups.has(label)) groups.set(label, []);
        groups.get(label).push(command);
      }
      const ordered = [...groups.entries()].sort((a, b) => {
        const indexA = CATEGORY_ORDER.indexOf(a[0]);
        const indexB = CATEGORY_ORDER.indexOf(b[0]);
        return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
      });
      const container = new ContainerBuilder().setAccentColor(0x00ff00);
      container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## Liste des commandes\nPréfixe : \`${prefix}\` — ${client.commands.size} commande(s) disponible(s)`,));
      container.addSeparatorComponents(new SeparatorBuilder());
      for (const [label, commands] of ordered) {
        const lines = commands
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((command) => {
            const alias =
              Array.isArray(command.aliases) && command.aliases.length
                ? ` (alias : ${command.aliases.map((a) => `\`${prefix}${a}\``).join(", ")})`
                : "";
            return `\`${prefix}${command.name}\` — ${command.description || "Sans description"}${alias}`;
          });
        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`**${label}**\n${lines.join("\n")}`));
      }
      if (client.automod.length) {
        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**Protections automatiques**\n${client.automod
              .map((hook) => hook.name)
              .join(", ")} — elles s'appliquent à chaque message.`));
      }
      container.addSeparatorComponents(new SeparatorBuilder());
      container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# Généré le ${new Date().toLocaleString("fr-FR")} • ${message.author.tag}`,));
      await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error("Erreur dans help:", error);
      message.reply("Une erreur est survenue lors de l'affichage de la liste des commandes.");
    }
  },
};