const { ContainerBuilder, TextDisplayBuilder, MessageFlags } = require("discord.js");
module.exports = {
  name: "balance",
  description: "Affiche votre solde actuel",
  run: async (client, message, args) => {
    try {
      const user = await client.models.User.findOne({ id: message.author.id });
      if (!user) {
        const newUser = new client.models.User({
          id: message.author.id,
          username: message.author.username,
          discriminator: message.author.discriminator,
          balance: 0,
        });
        await newUser.save();
        const container = new ContainerBuilder()
          .addTextDisplayComponents(new TextDisplayBuilder().setContent("Vous avez 0 pièce. Commencez à en gagner avec !work"));
        return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }
      const container = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Vous avez ${user.balance} pièce(s)`));
      message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error("Erreur dans balance:", error);
      message.reply("Une erreur est survenue lors de la récupération du solde");
    }
  },
};
