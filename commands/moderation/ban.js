const {
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
} = require("discord.js");
module.exports = {
  name: "ban",
  description: "Bannit un membre du serveur",
  usage: "!ban @member [reason]",
  permissions: ["BanMembers"],
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply("Vous n'avez pas la permission de bannir des membres.");
    }
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) {
      return message.reply("Veuillez indiquer un membre à bannir.");
    }
    if (!member.bannable) {
      return message.reply("Je ne peux pas bannir ce membre.");
    }
    const reason = args.slice(1).join(" ") || "Aucune raison";
    try {
      await member.ban({ reason: reason });
      const container = new ContainerBuilder()
        .setAccentColor(0xff0000)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("Membre banni"))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Membre : ${member.user.tag}\nRaison : ${reason}\nPar : ${message.author.tag}`));
      await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error("Erreur dans ban:", error);
      message.reply("Une erreur est survenue lors de la tentative de bannissement.");
    }
  },
};
