const {
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
module.exports = {
  name: "messagelog",
  description: "Journalisation des messages (suppressions et modifications)",
  usage: "!messagelog [#salon]",
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
          .addTextDisplayComponents(new TextDisplayBuilder().setContent("Journal des messages configuré"))
          .addSeparatorComponents(new SeparatorBuilder())
          .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Salon de journal :** ${mentioned}\n**Événements suivis :** suppression et édition des messages\n**Configuré par :** ${message.author.tag}`,));
        return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }
      console.log(`Message de ${message.author.tag} dans ${message.channel.name} : ${message.content}`);
      const server = await client.models.Server.findOne({ id: message.guild.id });
      const status =
        server && server.logChannel
          ? `Activée dans <#${server.logChannel}>`
          : "Désactivée mentionnez un salon pour l'activer.";
      const container = new ContainerBuilder()
        .setAccentColor(0x00ff00)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("Journalisation des messages"))
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Événements suivis :** suppression et édition des messages\n**Journal :** ${status}`))
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# Activez-le avec \`${message.content.split(" ")[0]} #salon\``));
      return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error("Erreur dans messageLog:", error);
      return message.reply("Une erreur est survenue lors de la journalisation des messages.");
    }
  },
};
