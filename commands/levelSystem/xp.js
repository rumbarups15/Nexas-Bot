const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
module.exports = {
  name: "xp",
  description: "Affiche vos points d'expérience",
  run: async (client, message, args) => {
    try {
      let user = await client.models.User.findOne({ id: message.author.id });
      if (!user) {
        user = new client.models.User({
          id: message.author.id,
          username: message.author.username,
          discriminator: message.author.discriminator,
          xp: 0,
          level: 1,
        });
        await user.save();
        const noXpContainer = new ContainerBuilder()
          .setAccentColor(0xff0000)
          .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Vous n'avez pas encore de points d'expérience ! Commencez à écrire sur le serveur pour gagner de l'XP.`));
        return message.reply({
          components: [noXpContainer],
          flags: MessageFlags.IsComponentsV2,
        });
      }
      const level = Number(user.level) || 1;
      const currentXp = Number(user.xp) || 0;
      const xpNeeded = level * 100;
      const progress = Math.max(0, Math.min(100, Math.floor((currentXp / xpNeeded) * 100)));
      const remaining = Math.max(0, xpNeeded - currentXp);
      const titleText = new TextDisplayBuilder().setContent(`## Niveau de ${message.author.username}`);
      const statsText = new TextDisplayBuilder().setContent(`**Niveau :** ${level}\n**Points d'expérience :** ${currentXp}\n**Progression :** ${progress}% (${currentXp}/${xpNeeded})`);
      const footerText = new TextDisplayBuilder().setContent(`-# Il vous faut ${remaining} XP pour le niveau suivant • ${new Date().toLocaleString("fr-FR")}`);
      const container = new ContainerBuilder()
        .setAccentColor(0x00ff00)
        .addTextDisplayComponents(titleText)
        .addTextDisplayComponents(statsText)
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(footerText);
      message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
    } catch (error) {
      console.error("Erreur dans xp :", error);
      message.reply("Une erreur est survenue lors de la récupération des points d'expérience.");
    }
  },
};
