const {
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
} = require("discord.js");
module.exports = {
  name: "unmute",
  description: "Retire le mute d'un membre",
  usage: "!unmute @member",
  permissions: ["ModerateMembers"],
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply("Vous n'avez pas la permission de retirer le mute des membres.");
    }
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) {
      return message.reply("Veuillez indiquer un membre à démuter.");
    }
    try {
      await member.timeout(null);
      const container = new ContainerBuilder()
        .setAccentColor(0x00ff00)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("Mute retiré"))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Membre : ${member.user.tag}\nPar : ${message.author.tag}`));
      await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error("Erreur dans unmute:", error);
      message.reply("Une erreur est survenue lors de la tentative de retrait du mute.");
    }
  },
};
