const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
} = require("discord.js");
module.exports = {
  name: "invite",
  description: "Affiche le lien d'invitation du serveur",
  usage: "!invite",
  aliases: ["serverinvite"],
  cooldown: 10_000,
  run: async (client, message, args) => {
    try {
      const invite = await message.channel.createInvite({
        maxAge: 86400,
        maxUses: 10,
        reason: `Demandé par ${message.author.tag}`,
      });
      const container = new ContainerBuilder()
        .setAccentColor(0x00ff00)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("Lien d'invitation du serveur"))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`[Cliquez ici pour rejoindre](${invite.url})`))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Durée : 24 heures\nUtilisations : 10`));
      await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error("Erreur dans serverinvite:", error);
      message.reply("Une erreur est survenue lors de la création du lien d'invitation.");
    }
  },
};
