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
  name: "welcome",
  description: "Souhaite la bienvenue à un membre",
  run: async (client, message, args) => {
    try {
      let targetUser = message.author;
      if (args[0]) {
        const mentioned = message.mentions.users.first();
        if (mentioned) targetUser = mentioned;
      }
      const mainSection = new SectionBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## Bienvenue !`))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Bienvenue sur **${message.guild.name}**, ${targetUser} !`))
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(targetUser.displayAvatarURL({ extension: "png", size: 256 })));
      const infoText = new TextDisplayBuilder().setContent(`**Compte créé le :** ${new Date(targetUser.createdAt).toLocaleDateString("fr-FR")}\n**Nombre de membres :** ${message.guild.memberCount}`);
      const footerText = new TextDisplayBuilder().setContent(`-# Bienvenue souhaitée par ${message.author.tag}`);
      const container = new ContainerBuilder()
        .setAccentColor(0x00ff00)
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
      console.error("Erreur dans welcome :", error);
      message.reply("Une erreur est survenue lors du souhait de bienvenue.");
    }
  },
};