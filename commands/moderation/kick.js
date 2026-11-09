const {
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
} = require("discord.js");
module.exports = {
  name: "kick",
  description: "Expulse un membre du serveur",
  usage: "!kick @member [reason]",
  permissions: ["KickMembers"],
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return message.reply("Vous n'avez pas la permission d'expulser des membres.");
    }
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) {
      return message.reply("Veuillez indiquer un membre à expulser.");
    }
    if (!member.kickable) {
      return message.reply("Je ne peux pas expulser ce membre.");
    }
    const reason = args.slice(1).join(" ") || "Aucune raison";
    try {
      await member.kick(reason);
      const container = new ContainerBuilder()
        .setAccentColor(0xffa500)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("Membre expulsé"))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Membre : ${member.user.tag}\nRaison : ${reason}\nPar : ${message.author.tag}`));
      await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error("Erreur dans kick:", error);
      message.reply("Une erreur est survenue lors de la tentative d'expulsion.");
    }
  },
};
