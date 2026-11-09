const {
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
} = require("discord.js");
module.exports = {
  name: "warn",
  description: "Avertit un membre",
  usage: "!warn @member <reason>",
  permissions: ["ModerateMembers"],
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply("Vous n'avez pas la permission d'avertir des membres.");
    }
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) {
      return message.reply("Veuillez indiquer un membre à avertir.");
    }
    const reason = args.slice(1).join(" ") || "Aucune raison";
    try {
      let user = await client.models.User.findOne({ id: member.id });
      if (!user) {
        user = new client.models.User({
          id: member.id,
          username: member.user.username,
          discriminator: member.user.discriminator,
          warnings: 1,
        });
      } else {
        user.warnings = (user.warnings || 0) + 1;
      }
      await user.save();
      const container = new ContainerBuilder()
        .setAccentColor(0xffa500)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("Avertissement donné"))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Membre : ${member.user.tag}\nNombre d'avertissements : ${user.warnings}\nRaison : ${reason}\nPar : ${message.author.tag}`));
      await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error("Erreur dans warn:", error);
      message.reply("Une erreur est survenue lors de la tentative d'avertissement.");
    }
  },
};
