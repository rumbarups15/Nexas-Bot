const {
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
module.exports = {
  name: "setleave",
  description: "Définit le salon et le message d'adieu",
  usage: "!setleave #salon [message] ({user} {server} {count})",
  permissions: ["Administrator"],
  cooldown: 5000,
  run: async (client, message, args) => {
    try {
      if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return message.reply("Vous n'avez pas la permission de définir le salon des adieux.");
      }
      const channel = message.mentions.channels.first();
      if (!channel) {
        return message.reply("Veuillez mentionner un salon pour les messages d'adieu. Exemple : `!setleave #adieu Au revoir {user} !`");
      }
      const mentionIndex = args.findIndex((arg) => arg.includes(channel.id));
      const custom = args
        .filter((arg, index) => index !== mentionIndex)
        .join(" ")
        .trim();
      let server = await client.models.Server.findOne({ id: message.guild.id });
      if (!server) server = new client.models.Server({ id: message.guild.id });
      server.leaveChannel = channel.id;
      server.leaveMessage = custom || null;
      await server.save();
      const container = new ContainerBuilder()
        .setAccentColor(0x00ff00)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("## Salon des adieux configuré"))
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Salon :** ${channel}\n**Message :** ${custom ? custom : "(message par défaut du bot)"}\n**Configuré par :** ${message.author.tag}`))
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("-# Variables disponibles : `{user}`, `{server}`, `{count}`"));
      await message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
    } catch (error) {
      console.error("Erreur dans setleave :", error);
      message.reply("Une erreur est survenue lors de la configuration du salon des adieux.");
    }
  },
};