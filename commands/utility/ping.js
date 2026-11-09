const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
} = require("discord.js");
module.exports = {
  name: "ping",
  description: "Affiche la vitesse de connexion du bot",
  aliases: ["latency"],
  run: async (client, message, args) => {
    try {
      const sent = await message.reply("Calcul du ping en cours...");
      const container = new ContainerBuilder()
        .setAccentColor(0x00ff00)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("Informations sur le ping"))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Temps de réponse : ${sent.createdTimestamp - message.createdTimestamp}ms\nWebSocket : ${client.ws.ping}ms`));
      await sent.edit({
        content: null,
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
    } catch (error) {
      console.error("Erreur dans ping:", error);
      message.reply("Une erreur est survenue lors du calcul du ping.");
    }
  },
};
