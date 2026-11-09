const {
  ContainerBuilder,
  SectionBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ThumbnailBuilder,
  MessageFlags,
} = require("discord.js");
module.exports = {
  name: "rank",
  description: "Affiche votre carte de rang",
  run: async (client, message, args) => {
    try {
      let targetUser = message.author;
      if (args[0]) {
        const mentioned = message.mentions.users.first();
        if (mentioned) targetUser = mentioned;
      }
      let user = await client.models.User.findOne({ id: targetUser.id });
      if (!user) {
        user = new client.models.User({
          id: targetUser.id,
          username: targetUser.username,
          discriminator: targetUser.discriminator,
          xp: 0,
          level: 1,
        });
        await user.save();
      }
      const allUsers = await client.models.User.find().sort({ level: -1, xp: -1 });
      const rank = allUsers.findIndex((u) => u.id === targetUser.id) + 1;
      const level = Number(user.level) || 1;
      const currentXp = Number(user.xp) || 0;
      const xpNeeded = level * 100;
      const progress = Math.max(0, Math.min(100, Math.floor((currentXp / xpNeeded) * 100)));
      const remaining = Math.max(0, xpNeeded - currentXp);
      const barLength = 20;
      const filled = Math.floor((progress / 100) * barLength);
      const empty = barLength - filled;
      const progressBar = "█".repeat(filled) + "░".repeat(empty);
      const mainSection = new SectionBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## Carte de rang de ${targetUser.username}`))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Rang :** #${rank}\n**Niveau :** ${level}\n**Points d'expérience :** ${currentXp}`))
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(targetUser.displayAvatarURL({ extension: "png", size: 256 })));
      const progressText = new TextDisplayBuilder().setContent(`**Progression :**\n\`${progressBar}\` ${progress}%`);
      const nextLevelText = new TextDisplayBuilder().setContent(`**XP nécessaire pour le niveau suivant :** ${remaining}`);
      const footerText = new TextDisplayBuilder().setContent(`-# Demandé par ${message.author.tag} • ${new Date().toLocaleString("fr-FR")}`);
      const container = new ContainerBuilder()
        .setAccentColor(0x00ff00)
        .addSectionComponents(mainSection)
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(progressText)
        .addTextDisplayComponents(nextLevelText)
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(footerText);
      message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
    } catch (error) {
      console.error("Erreur dans rank :", error);
      message.reply("Une erreur est survenue lors de la récupération de la carte de rang.");
    }
  },
};
