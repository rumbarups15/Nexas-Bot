const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
const config = require("../../config.json");
function currentRoleId(server) {
  return (server && server.autoRole) || config.autoRole || null;
}
module.exports = {
  name: "autorole",
  description: "Définit le rôle automatique et l'attribue à un membre",
  usage: "!autorole [@rôle] | !autorole @membre @rôle",
  cooldown: 3000,
  run: async (client, message, args) => {
    try {
      const mentionedRole = message.mentions.roles.first();
      const mentionedMember = message.mentions.members.first();
      const server = await client.models.Server.findOne({ id: message.guild.id });
      if (!mentionedRole && !mentionedMember) {
        const roleId = currentRoleId(server);
        const role = roleId ? message.guild.roles.cache.get(String(roleId)) : null;
        const container = new ContainerBuilder()
          .setAccentColor(role ? 0x00ff00 : 0xff0000)
          .addTextDisplayComponents(new TextDisplayBuilder().setContent("## Rôle automatique"))
          .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
          .addTextDisplayComponents(new TextDisplayBuilder().setContent(
              role
                ? `**Rôle attribué aux nouveaux membres :** ${role}\n**Source :** ${server && server.autoRole ? "configuré sur ce serveur" : "config.json"}`
                : "Aucun rôle automatique configuré (le rôle de config.json est introuvable).",
            ))
          .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
          .addTextDisplayComponents(new TextDisplayBuilder().setContent("-# Configurer : `!autorole @rôle` • Attribuer maintenant : `!autorole @membre @rôle`"));
        return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }
      if (mentionedRole && !mentionedMember) {
        if (!message.member.permissions.has("ManageRoles")) {
          return message.reply("Vous n'avez pas la permission de gérer les rôles.");
        }
        const target = server || new client.models.Server({ id: message.guild.id });
        target.id = message.guild.id;
        target.autoRole = mentionedRole.id;
        await target.save();
        const container = new ContainerBuilder()
          .setAccentColor(0x00ff00)
          .addTextDisplayComponents(new TextDisplayBuilder().setContent("## Rôle automatique configuré"))
          .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
          .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Rôle :** ${mentionedRole}\n**Appliqué à :** tous les nouveaux membres\n**Configuré par :** ${message.author.tag}`));
        return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }
      const targetMember = mentionedMember || message.member;
      const role = mentionedRole || message.guild.roles.cache.get(String(currentRoleId(server)));
      if (!role) {
        return message.reply("Aucun rôle spécifié. Utilisez : `!autorole @rôle` ou `!autorole @membre @rôle`");
      }
      if (!message.member.permissions.has("ManageRoles")) {
        return message.reply("Vous n'avez pas la permission de gérer les rôles.");
      }
      if (role.position >= message.guild.members.me.roles.highest.position) {
        return message.reply("Ce rôle est supérieur ou égal à mon rôle : je ne peux pas l'attribuer.");
      }
      if (targetMember.roles.cache.has(role.id)) {
        return message.reply(`${targetMember.user.tag} possède déjà le rôle ${role.name}.`);
      }
      await targetMember.roles.add(role);
      const container = new ContainerBuilder()
        .setAccentColor(0x00ff00)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("## Rôle ajouté"))
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Membre :** ${targetMember.user.tag}\n**Rôle :** ${role.name}\n**Attribué par :** ${message.author.tag}`));
      await message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
    } catch (error) {
      console.error("Erreur dans autorole :", error);
      message.reply("Une erreur est survenue lors de l'attribution du rôle.");
    }
  },
};