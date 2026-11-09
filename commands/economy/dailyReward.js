const { ContainerBuilder, TextDisplayBuilder, MessageFlags } = require("discord.js");
module.exports = {
  name: "daily",
  description: "Réclame une récompense journalière",
  run: async (client, message, args) => {
    try {
      let user = await client.models.User.findOne({ id: message.author.id });
      if (!user) {
        user = new client.models.User({
          id: message.author.id,
          username: message.author.username,
          discriminator: message.author.discriminator,
          balance: 0,
          lastDaily: null,
        });
        await user.save();
      }
      const now = new Date();
      const lastDaily = user.lastDaily;
      if (lastDaily) {
        const diff = now - new Date(lastDaily);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 24) {
          const remaining = 24 - hours;
          const container = new ContainerBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Vous pourrez réclamer votre récompense dans ${remaining} heure(s)`));
          return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }
      }
      const reward = 100;
      user.balance += reward;
      user.lastDaily = now;
      await user.save();
      const container = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Vous avez reçu ${reward} pièces ! Votre solde est maintenant de ${user.balance} pièce(s)`));
      message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error("Erreur dans daily:", error);
      message.reply("Une erreur est survenue lors de la réclamation de la récompense");
    }
  },
};
