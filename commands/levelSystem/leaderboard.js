const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
const MEDALS = ["🥇", "🥈", "🥉"];
module.exports = {
  name: "leaderboard",
  description: "Affiche le classement des meilleurs joueurs",
  usage: "!leaderboard",
  aliases: ["lb", "classement"],
  cooldown: 10_000,
  run: async (client, message, args) => {
    try {
      const users = await client.models.User.find()
        .sort({ level: -1, xp: -1 })
        .limit(10);
      if (!users || users.length === 0) {
        const emptyContainer = new ContainerBuilder()
          .setAccentColor(0xff0000)
          .addTextDisplayComponents(new TextDisplayBuilder().setContent("Il n'y a encore aucun utilisateur dans le classement !"));
        return message.reply({
          components: [emptyContainer],
          flags: MessageFlags.IsComponentsV2,
        });
      }
      const lines = users.map((user, index) => {
        const medal = MEDALS[index] || `${index + 1}.`;
        const xpNeeded = (Number(user.level) || 1) * 100;
        return `${medal} <@${user.id}> — Niveau **${user.level}** | XP **${user.xp}/${xpNeeded}**`;
      });
      const container = new ContainerBuilder()
        .setAccentColor(0xffd700)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("## Classement des meilleurs joueurs"))
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(lines.join("\n")))
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# ${users.length} joueur(s) affiché(s) • ${new Date().toLocaleString("fr-FR")}`,));
      message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error("Erreur dans leaderboard :", error);
      message.reply("Une erreur est survenue lors de la récupération du classement.");
    }
  },
};