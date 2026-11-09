const {
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
function logStatus(server) {
  return server && server.logChannel
    ? `Activée dans <#${server.logChannel}>`
    : "Désactivée — mentionnez un salon pour l'activer.";
}
module.exports = {
  name: "channellog",
  description: "Journalisation des salons (et définition du salon de journal)",
  usage: "!channellog [#salon]",
  run: async (client, message, args) => {
    try {
      const mentioned = message.mentions.channels.first();
      if (mentioned) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
          return message.reply("Vous n'avez pas la permission de configurer le journal.");
        }
        let server = await client.models.Server.findOne({ id: message.guild.id });
        if (!server) server = new client.models.Server({ id: message.guild.id });
        server.logChannel = mentioned.id;
        await server.save();
        const container = new ContainerBuilder()
          .setAccentColor(0x00ff00)
          .addTextDisplayComponents(new TextDisplayBuilder().setContent("Journal des salons configuré"))
          .addSeparatorComponents(new SeparatorBuilder())
          .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Salon de journal :** ${mentioned}\n**Configuré par :** ${message.author.tag}`));
        return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }
      const channels = message.guild.channels.cache;
      const textChannels = channels.filter((c) => c.type === 0).size;
      const voiceChannels = channels.filter((c) => c.type === 2).size;
      const categoryChannels = channels.filter((c) => c.type === 4).size;
      const server = await client.models.Server.findOne({ id: message.guild.id });
      console.log(`Informations sur les salons de ${message.guild.name} :`);
      console.log(`Salons textuels : ${textChannels}`);
      console.log(`Salons vocaux : ${voiceChannels}`);
      console.log(`Catégories : ${categoryChannels}`);
      console.log(`Total : ${channels.size}`);
      const container = new ContainerBuilder()
        .setAccentColor(0x00ff00)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("Journalisation des salons"))
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Salons textuels :** ${textChannels}\n**Salons vocaux :** ${voiceChannels}\n**Catégories :** ${categoryChannels}\n**Total :** ${channels.size}`))
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Journal :** ${logStatus(server)}`));
      return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error("Erreur dans channelLog:", error);
      return message.reply("Une erreur est survenue lors de la journalisation des salons.");
    }
  },
};