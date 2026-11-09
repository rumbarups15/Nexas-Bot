const {
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  ThumbnailBuilder,
  SeparatorBuilder,
  MessageFlags,
} = require("discord.js");
module.exports = {
  name: "serverinfo",
  description: "Affiche les informations du serveur",
  run: async (client, message, args) => {
    try {
      const guild = message.guild;
      const iconUrl = guild.iconURL({ dynamic: true });
      const titleText = new TextDisplayBuilder().setContent(`Informations sur ${guild.name}`);
      const container = new ContainerBuilder().setAccentColor(0x00ff00);
      if (iconUrl) {
        container.addSectionComponents(
          new SectionBuilder()
            .addTextDisplayComponents(titleText)
            .setThumbnailAccessory(new ThumbnailBuilder().setURL(iconUrl))
        );
      } else {
        container.addTextDisplayComponents(titleText);
      }
      container
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`ID : ${guild.id}\nPropriétaire : <@${guild.ownerId}>\nCréé le : ${new Date(guild.createdAt).toLocaleDateString()}\nMembres : ${guild.memberCount}\nSalons : ${guild.channels.cache.size}\nRôles : ${guild.roles.cache.size}\nNiveau de vérification : ${guild.verificationLevel}`))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Demandé par ${message.author.tag}`));
      await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error("Erreur dans serverinfo:", error);
      message.reply("Une erreur est survenue lors de l'affichage des informations du serveur.");
    }
  },
};