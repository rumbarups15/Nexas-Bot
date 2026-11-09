const {
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
module.exports = {
  name: "voicelog",
  description: "Journalisation vocale (connexions, déconnexions, déplacements)",
  usage: "!voicelog [#salon]",
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
          .addTextDisplayComponents(new TextDisplayBuilder().setContent("Journal vocal configuré"))
          .addSeparatorComponents(new SeparatorBuilder())
          .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Salon de journal :** ${mentioned}\n**Événements suivis :** connexions, déconnexions et déplacements\n**Configuré par :** ${message.author.tag}`));
        return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }
      const voiceChannels = message.guild.channels.cache.filter((c) => c.type === 2);
      const occupied = voiceChannels
        .filter((c) => c.members.size > 0)
        .map((c) => `**${c.name}** : ${c.members.size} membre(s)`)
        .join("\n");
      if (message.member && message.member.voice.channel) {
        const channel = message.member.voice.channel;
        console.log(`${message.author.tag} dans le salon : ${channel.name}`);
        console.log(`Nombre de membres : ${channel.members.size}`);
      } else {
        console.log(`${message.author.tag} n'est dans aucun salon vocal`);
      }
      const server = await client.models.Server.findOne({ id: message.guild.id });
      const status =
        server && server.logChannel
          ? `Activée dans <#${server.logChannel}>`
          : "Désactivée — mentionnez un salon pour l'activer.";
      const container = new ContainerBuilder()
        .setAccentColor(0x00ff00)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("Journalisation vocale"))
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(occupied || "Aucun salon vocal occupé pour le moment.",))
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Journal :** ${status}`));
      return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error("Erreur dans voiceLog:", error);
      return message.reply("Une erreur est survenue lors de la journalisation vocale.");
    }
  },
};