const {
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
} = require("discord.js");
module.exports = {
  name: "unban",
  description: "Débannit un membre",
  usage: "!unban <userID>",
  permissions: ["BanMembers"],
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply("Vous n'avez pas la permission de débannir des membres.");
    }
    const userId = args[0];
    if (!userId) {
      return message.reply("Veuillez indiquer l'identifiant du membre à débannir.");
    }
    try {
      const bannedUsers = await message.guild.bans.fetch();
      const bannedUser = bannedUsers.find((user) => user.user.id === userId);
      if (!bannedUser) {
        return message.reply("Ce membre n'est pas banni.");
      }
      await message.guild.members.unban(userId);
      const container = new ContainerBuilder()
        .setAccentColor(0x00ff00)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("Débannissement effectué"))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Membre : ${bannedUser.user.tag}\nPar : ${message.author.tag}`));
      await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error("Erreur dans unban:", error);
      message.reply("Une erreur est survenue lors de la tentative de débannissement.");
    }
  },
};
