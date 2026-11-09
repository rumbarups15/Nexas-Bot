const {
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
module.exports = {
  name: "moderationlog",
  description: "Journalisation de la modération (bannissements, timeouts, sanctions)",
  usage: "!moderationlog [#salon]",
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
          .addTextDisplayComponents(new TextDisplayBuilder().setContent("Journal de modération configuré"))
          .addSeparatorComponents(new SeparatorBuilder())
          .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Salon de journal :** ${mentioned}\n**Événements suivis :** bannissements, débannissements, restrictions\n**Configuré par :** ${message.author.tag}`));
        return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }
      console.log(`Commande de modération de ${message.author.tag} : ${message.content}`);
      const target = message.mentions.members.first();
      if (target) {
        console.log(`Cible : ${target.user.tag} (${target.id})`);
      }
      const server = await client.models.Server.findOne({ id: message.guild.id });
      const status =
        server && server.logChannel
          ? `Activée dans <#${server.logChannel}>`
          : "Désactivée mentionnez un salon pour l'activer.";
      const warned = await Promise.all(
        (await client.models.User.find({}))
          .filter((u) => Number(u.warnings) > 0)
          .slice(0, 5)
          .map(async (u) => {
            const user = await client.users.fetch(u.id).catch(() => null);
            return `• ${user ? user.tag : u.id} — ${u.warnings} avertissement(s)`;
          }),
      );
      const container = new ContainerBuilder()
        .setAccentColor(0xffa500)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("Journalisation de la modération"))
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Événements suivis :** bannissements, débannissements, restrictions\n**Journal :** ${status}`))
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(warned.length ? `**Avertissements enregistrés :**\n${warned.join("\n")}` : "Aucun avertissement enregistré."));
      return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error("Erreur dans moderationLog:", error);
      return message.reply("Une erreur est survenue lors de la journalisation de la modération.");
    }
  },
};
