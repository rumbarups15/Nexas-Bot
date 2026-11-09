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
  name: "leave",
  description: "Message d'adieu pour un membre",
  run: async (client, message, args) => {
    try {
      let targetUser = message.author;
      if (args[0]) {
        const mentioned = message.mentions.users.first();
        if (mentioned) targetUser = mentioned;
      }
      const mainSection = new SectionBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## Au revoir !`))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Au revoir ${targetUser}, nous te souhaitons bonne chance !`))
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(targetUser.displayAvatarURL({ extension: "png", size: 256 })));
      const infoText = new TextDisplayBuilder().setContent(`**Date du départ :** ${new Date().toLocaleString("fr-FR")}\n**Membres restants :** ${message.guild.memberCount}`);
      const footerText = new TextDisplayBuilder().setContent(`-# Adieu envoyé par ${message.author.tag}`);
      const container = new ContainerBuilder()
        .setAccentColor(0xff0000)
        .addSectionComponents(mainSection)
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(infoText)
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(footerText);
      await message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
    } catch (error) {
      console.error("Erreur dans leave :", error);
      message.reply("Une erreur est survenue lors de l'envoi du message d'adieu.");
    }
  },
};