const {
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  ThumbnailBuilder,
  SeparatorBuilder,
  MessageFlags,
} = require("discord.js");
module.exports = {
  name: "userinfo",
  description: "Affiche les informations de l'utilisateur",
  run: async (client, message, args) => {
    try {
      let user = message.author;
      let member = message.member;
      if (args[0]) {
        const mentioned = message.mentions.users.first();
        if (mentioned) {
          user = mentioned;
          member = message.guild.members.cache.get(user.id);
        }
      }
      const container = new ContainerBuilder()
        .setAccentColor(0x00ff00)
        .addSectionComponents(new SectionBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Informations sur ${user.tag}`))
            .setThumbnailAccessory(new ThumbnailBuilder().setURL(user.displayAvatarURL({ dynamic: true }))))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`ID : ${user.id}\nNom d'utilisateur : ${user.username}\nCréé le : ${new Date(user.createdAt).toLocaleDateString()}\nRejoint le : ${member ? new Date(member.joinedAt).toLocaleDateString() : "Inconnu"}\nRôles : ${member ? member.roles.cache.map((r) => r.name).join(", ") : "Aucun"}`))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Demandé par ${message.author.tag}`));
      await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error("Erreur dans userinfo:", error);
      message.reply("Une erreur est survenue lors de l'affichage des informations de l'utilisateur.",);
    }
  },
};