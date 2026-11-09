const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
} = require("discord.js");
module.exports = {
  name: "permission",
  description: "Affiche vos permissions ou celles d'un autre membre",
  run: async (client, message, args) => {
    try {
      let member = message.member;
      if (args[0]) {
        const mentioned = message.mentions.members.first();
        if (mentioned) member = mentioned;
      }
      const permissions = member.permissions.toArray();
      const permissionNames = {
        Administrator: "Administrateur",
        BanMembers: "Bannir les membres",
        KickMembers: "Expulser les membres",
        ManageChannels: "Gérer les salons",
        ManageGuild: "Gérer le serveur",
        ManageMessages: "Gérer les messages",
        ManageRoles: "Gérer les rôles",
        ModerateMembers: "Modérer les membres",
        SendMessages: "Envoyer des messages",
        ViewChannel: "Voir les salons",
      };
      const translatedPerms = permissions.map((perm) => {
        return permissionNames[perm] || perm;
      });
      const container = new ContainerBuilder()
        .setAccentColor(0x00ff00)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Permissions de ${member.user.tag}`))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(translatedPerms.length > 0 ? translatedPerms.map((p, i) => `${i + 1}. ${p}`).join("\n") : "Aucune permission"))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Nombre de permissions : ${translatedPerms.length}`));
      await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error("Erreur dans permission:", error);
      message.reply("Une erreur est survenue lors de l'affichage des permissions.");
    }
  },
};
