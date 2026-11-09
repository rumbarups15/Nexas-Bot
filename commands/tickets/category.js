const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
} = require("discord.js");
module.exports = {
  name: "category",
  description: "Affiche les tickets d'une catégorie donnée",
  usage: "!category <categoryID>",
  run: async (client, message, args) => {
    try {
      if (!args[0]) {
        return message.reply("Veuillez indiquer l'identifiant de la catégorie.");
      }
      const categoryId = args[0];
      const tickets = await client.models.Ticket.find({ categoryId: categoryId });
      if (!tickets || tickets.length === 0) {
        return message.reply("Aucun ticket trouvé dans cette catégorie.");
      }
      const container = new ContainerBuilder()
        .setAccentColor(0x00ff00)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Tickets de la catégorie ${categoryId}`))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(tickets.map((t) => { const status = t.status === "open" ? "Ouvert" : "Fermé"; return `Ticket ${t.id} - ${status}`; }).join("\n")))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Nombre de tickets : ${tickets.length}`));
      await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error("Erreur dans category:", error);
      message.reply("Une erreur est survenue lors de l'affichage des tickets.");
    }
  },
};
