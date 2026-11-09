const {
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
} = require("discord.js");
module.exports = {
  name: "timeout",
  description: "Restreint temporairement un membre",
  usage: "!timeout @member <minutes> [reason]",
  permissions: ["ModerateMembers"],
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply("Vous n'avez pas la permission de restreindre des membres.");
    }
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) {
      return message.reply("Veuillez indiquer un membre à restreindre.");
    }
    const duration = parseInt(args[1]);
    if (!duration || duration < 1) {
      return message.reply("Veuillez indiquer une durée valide en minutes.");
    }
    const reason = args.slice(2).join(" ") || "Aucune raison";
    const milliseconds = duration * 60 * 1000;
    try {
      await member.timeout(milliseconds, reason);
      const container = new ContainerBuilder()
        .setAccentColor(0xffa500)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("Membre restreint"))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Membre : ${member.user.tag}\nDurée : ${duration} minute(s)\nRaison : ${reason}\nPar : ${message.author.tag}`));
      await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error("Erreur dans timeout:", error);
      message.reply("Une erreur est survenue lors de la tentative de restriction.");
    }
  },
};
