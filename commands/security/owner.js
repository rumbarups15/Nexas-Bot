const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
} = require("discord.js");
const config = require("../../config.json");
module.exports = {
  name: "owner",
  description: "Affiche les informations du propriétaire",
  run: async (client, message, args) => {
    try {
      const isOwner = message.author.id === config.ownerId;
      const container = new ContainerBuilder()
        .setAccentColor(0xffd700)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("Informations sur le propriétaire"))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`ID du propriétaire : ${config.ownerId || "Non défini"}\nÊtes-vous le propriétaire ? ${isOwner ? "Oui" : "Non"}`));
      await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error("Erreur dans owner:", error);
      message.reply(
        "Une erreur est survenue lors de l'affichage des informations du propriétaire.",
      );
    }
  },
};
