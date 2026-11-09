const {
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
} = require("discord.js");
module.exports = {
  name: "mute",
  description: "Met en sourdine un membre",
  usage: "!mute @member [duration] [reason]",
  permissions: ["ModerateMembers"],
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply("Vous n'avez pas la permission de mute des membres.");
    }
    const mentioned = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!mentioned) {
      return message.reply("Veuillez indiquer un membre à mute.");
    }
    const member = mentioned;
    const parsed = parseInt(args[1], 10);
    const hasDuration = Number.isFinite(parsed) && parsed > 0;
    const duration = hasDuration ? Math.min(parsed, 40320) : 5;
    const reason = args.slice(hasDuration ? 2 : 1).join(" ") || "Aucune raison";
    const milliseconds = duration * 60 * 1000;
    try {
      await member.timeout(milliseconds, reason);
      const container = new ContainerBuilder()
        .setAccentColor(0xffa500)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("Membre mute"))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Membre : ${member.user.tag}\nDurée : ${duration} minute(s)\nRaison : ${reason}\nPar : ${message.author.tag}`));
      await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error("Erreur dans mute:", error);
      message.reply("Une erreur est survenue lors de la tentative de mute.");
    }
  },
};
