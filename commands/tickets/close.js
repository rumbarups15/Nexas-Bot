const { ContainerBuilder, TextDisplayBuilder, MessageFlags } = require("discord.js");
module.exports = {
  name: "close",
  description: "Ferme le ticket actuel",
  run: async (client, message, args) => {
    try {
      const ticket = await client.models.Ticket.findOne({ channelId: message.channel.id });
      if (!ticket) {
        return message.reply("Ce salon n'est pas un ticket.");
      }
      if (ticket.status === "closed") {
        return message.reply("Ce ticket est déjà fermé.");
      }
      ticket.status = "closed";
      ticket.closedAt = new Date();
      await ticket.save();
      const messages = Array.isArray(ticket.transcript) ? ticket.transcript.length : 0;
      const container = new ContainerBuilder()
        .setAccentColor(0xff0000)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("## Ticket fermé"))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `Fermé par ${message.author}\n**Messages enregistrés :** ${messages}\nLe salon sera supprimé dans 5 secondes.`,
          ),
        );
      await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
      setTimeout(async () => {
        try {
          await message.channel.delete();
        } catch (error) {
          console.error("Erreur lors de la suppression du salon:", error);
        }
      }, 5000);
    } catch (error) {
      console.error("Erreur dans close:", error);
      message.reply("Une erreur est survenue lors de la fermeture du ticket.");
    }
  },
};
