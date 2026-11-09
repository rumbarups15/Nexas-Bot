const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
} = require("discord.js");
module.exports = {
  name: "inventory",
  description: "Affiche votre inventaire",
  run: async (client, message, args) => {
    try {
      let user = await client.models.User.findOne({ id: message.author.id });
      if (!user) {
        user = new client.models.User({
          id: message.author.id,
          username: message.author.username,
          discriminator: message.author.discriminator,
          balance: 0,
          inventory: [],
        });
        await user.save();
      }
      const inventory = user.inventory || [];
      if (inventory.length === 0) {
        return message.reply("Votre inventaire est vide ! Achetez des articles dans la boutique.");
      }
      const container = new ContainerBuilder()
        .setAccentColor(0x00ff00)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Inventaire de ${message.author.username}`))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(inventory.map((item, index) => `${index + 1}. ${item}`).join("\n")))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Nombre d'articles : ${inventory.length}`));
      message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error("Erreur dans inventory:", error);
      message.reply("Une erreur est survenue lors de l'affichage de l'inventaire");
    }
  },
};
