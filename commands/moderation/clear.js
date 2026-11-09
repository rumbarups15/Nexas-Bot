const {
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags,
} = require("discord.js");
module.exports = {
  name: "clear",
  description: "Supprime des messages",
  usage: "!clear <number>",
  permissions: ["ManageMessages"],
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply("Vous n'avez pas la permission de supprimer des messages.");
    }
    const amount = parseInt(args[0]);
    if (!amount || amount < 1 || amount > 100) {
      return message.reply("Veuillez indiquer un nombre entre 1 et 100.");
    }
    try {
      const messages = await message.channel.bulkDelete(amount, true);
      const container = new ContainerBuilder()
        .setAccentColor(0xff0000)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("Suppression effectuée"))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`${messages.size} message(s) supprimé(s)`));
      const reply = await message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
      setTimeout(() => reply.delete(), 5000);
    } catch (error) {
      console.error("Erreur dans clear:", error);
      message.reply("Une erreur est survenue lors de la tentative de suppression des messages.");
    }
  },
};
