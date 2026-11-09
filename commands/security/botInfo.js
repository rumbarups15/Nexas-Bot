const {
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  ThumbnailBuilder,
  SeparatorBuilder,
  MessageFlags,
} = require("discord.js");
module.exports = {
  name: "botinfo",
  description: "Affiche les informations du bot",
  run: async (client, message, args) => {
    try {
      const uptime = process.uptime();
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      const container = new ContainerBuilder()
        .setAccentColor(0x00ff00)
        .addSectionComponents(new SectionBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent("Informations sur le bot"))
            .setThumbnailAccessory(new ThumbnailBuilder().setURL(client.user.displayAvatarURL({ dynamic: true }))))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Nom : ${client.user.tag}\nID : ${client.user.id}\nServeurs : ${client.guilds.cache.size}\nUtilisateurs : ${client.users.cache.size}\nTemps de fonctionnement : ${days}j ${hours}h ${minutes}m ${seconds}s\nMémoire utilisée : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Demandé par ${message.author.tag}`));
      await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error("Erreur dans botInfo:", error);
      message.reply("Une erreur est survenue lors de l'affichage des informations du bot.");
    }
  },
};
