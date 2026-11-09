const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
} = require("discord.js");
module.exports = {
  name: "ticketlog",
  description: "Affiche le journal d'un ticket",
  usage: "!ticketlog <ticketID>",
  run: async (client, message, args) => {
    try {
      if (!args[0]) {
        return message.reply("Veuillez indiquer l'identifiant du ticket.");
      }
      const ticket = await client.models.Ticket.findOne({ id: args[0] });
      if (!ticket) {
        return message.reply("Aucun ticket trouvé.");
      }
      const container = new ContainerBuilder()
        .setAccentColor(0x00ff00)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Journal du ticket ${ticket.id}`))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Utilisateur : <@${ticket.userId}>\nStatut : ${ticket.status === "open" ? "Ouvert" : "Fermé"}\nCréé le : ${new Date(ticket.createdAt).toLocaleString()}\nFermé le : ${ticket.closedAt ? new Date(ticket.closedAt).toLocaleString() : "Non fermé"}\nMessages : ${ticket.transcript ? ticket.transcript.length : 0}`));
      await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error("Erreur dans ticketlog:", error);
      message.reply("Une erreur est survenue lors de l'affichage du journal du ticket.");
    }
  },
};
