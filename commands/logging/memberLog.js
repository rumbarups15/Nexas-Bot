const {
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
module.exports = {
  name: "memberlog",
  description: "Journalisation des membres (arrivées, départs, rôles)",
  usage: "!memberlog [#salon]",
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
          .addTextDisplayComponents(new TextDisplayBuilder().setContent("Journal des membres configuré"))
          .addSeparatorComponents(new SeparatorBuilder())
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`**Salon de journal :** ${mentioned}\n**Événements suivis :** arrivées, départs, expulsions et rôles\n**Configuré par :** ${message.author.tag}`));
        return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }
      console.log(`Membre : ${message.author.tag} (${message.author.id})`);
      console.log(`Dans le serveur : ${message.guild.name} (${message.guild.id})`);
      if (message.member) {
        console.log(`Rôles : ${message.member.roles.cache.map((r) => r.name).join(", ")}`);
      }
      const server = await client.models.Server.findOne({ id: message.guild.id });
      const status =
        server && server.logChannel
          ? `Activée dans <#${server.logChannel}>`
          : "Désactivée — mentionnez un salon pour l'activer.";
      const container = new ContainerBuilder()
        .setAccentColor(0x00ff00)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("Journalisation des membres"))
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Membres :** ${message.guild.memberCount}\n**Événements suivis :** arrivées, départs, expulsions, rôles\n**Journal :** ${status}`,));
      return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error("Erreur dans memberLog:", error);
      return message.reply("Une erreur est survenue lors de la journalisation des membres.");
    }
  },
};