const { ContainerBuilder, TextDisplayBuilder, MessageFlags } = require("discord.js");
module.exports = {
  name: "work",
  description: "Travaille pour gagner de l'argent",
  run: async (client, message, args) => {
    try {
      let user = await client.models.User.findOne({ id: message.author.id });
      if (!user) {
        user = new client.models.User({
          id: message.author.id,
          username: message.author.username,
          discriminator: message.author.discriminator,
          balance: 0,
        });
        await user.save();
      }
      const jobs = [
        "programmeur",
        "designer",
        "écrivain",
        "traducteur",
        "enseignant",
        "médecin",
        "ingénieur",
        "avocat",
      ];
      const job = jobs[Math.floor(Math.random() * jobs.length)];
      const earnings = Math.floor(Math.random() * 50) + 10;
      user.balance += earnings;
      await user.save();
      const container = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Vous avez travaillé comme ${job} et gagné ${earnings} pièces ! Votre solde est maintenant de ${user.balance} pièce(s)`));
      message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error("Erreur dans work:", error);
      message.reply("Une erreur est survenue lors du travail");
    }
  },
};
