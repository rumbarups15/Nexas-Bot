const {
  ContainerBuilder,
  TextDisplayBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  SeparatorBuilder,
  MessageFlags,
} = require("discord.js");
module.exports = {
  name: "avatar",
  description: "Affiche la photo de profil de l'utilisateur",
  run: async (client, message, args) => {
    try {
      let user = message.author;
      if (args[0]) {
        const mentioned = message.mentions.users.first();
        if (mentioned) user = mentioned;
      }
      const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 1024 });
      const container = new ContainerBuilder()
        .setAccentColor(0x00ff00)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Photo de profil de ${user.username}`))
        .addMediaGalleryComponents(new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(avatarUrl)))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Demandé par ${message.author.tag}`));
      await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error("Erreur dans avatar:", error);
      message.reply("Une erreur est survenue lors de l'affichage de la photo.");
    }
  },
};