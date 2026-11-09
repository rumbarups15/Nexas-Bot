const {
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");

const ticketCommand = {
  name: "ticket",
  description: "Crée un nouveau ticket",
  usage: "!ticket <raison>",
  cooldown: 10_000,
  run: async (client, message, args) => {
    try {
      const reason = args.join(" ") || "Aucune raison";

      const existingTicket = await client.models.Ticket.findOne({
        userId: message.author.id,
        status: "open",
      });
      if (existingTicket) {
        return message.reply(
          `Vous avez déjà un ticket ouvert : <#${existingTicket.channelId}>`,
        );
      }

      const me = message.guild.members.me;
      if (!me || !me.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply(
          "Je n'ai pas la permission **Gérer les salons** : impossible de créer un ticket.",
        );
      }

      const channel = await message.guild.channels.create({
        name: `ticket-${message.author.username}`.toLowerCase().replace(/[^a-z0-9-_]/g, "-").slice(0, 100),
        type: 0,
        parent: null,
        permissionOverwrites: [
          {
            id: message.guild.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: message.author.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
          },
          {
            id: me.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
            ],
          },
        ],
      });

      const ticket = new client.models.Ticket({
        id: channel.id,
        userId: message.author.id,
        channelId: channel.id,
        categoryId: channel.parentId,
        status: "open",
        transcript: [],
      });
      await ticket.save();

      const container = new ContainerBuilder()
        .setAccentColor(0x00ff00)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("## Nouveau ticket"))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`Bienvenue ${message.author} !`),
        )
        .addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small),
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`**Raison :** ${reason}\n**Statut :** Ouvert`),
        )
        .addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small),
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `Utilisez \`!close\` pour fermer ce ticket — id : \`${channel.id}\``,
          ),
        );
      await channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
      await message.reply(`Ticket créé : ${channel}`);
    } catch (error) {
      console.error("Erreur dans ticket:", error);
      message.reply("Une erreur est survenue lors de la création du ticket.");
    }
  },
};

const ticketsCommand = {
  name: "tickets",
  description: "Liste vos tickets (ou tous les tickets du serveur avec la permission)",
  usage: "!tickets [ouverts|fermes]",
  cooldown: 5000,
  run: async (client, message, args) => {
    try {
      const filter = (args[0] || "").toLowerCase();
      const staff = message.member.permissions.has(PermissionFlagsBits.ManageChannels);

      let tickets = await client.models.Ticket.find(
        staff && filter === "tous" ? {} : { userId: message.author.id },
      );
      if (Array.isArray(tickets)) {
        if (filter === "ouverts" || filter === "open") {
          tickets = tickets.filter((t) => t.status === "open");
        } else if (filter === "fermes" || filter === "closed") {
          tickets = tickets.filter((t) => t.status !== "open");
        }
      }

      if (!tickets || tickets.length === 0) {
        return message.reply("Aucun ticket trouvé. Créez-en un avec `!ticket`.");
      }

      const lines = tickets.slice(0, 25).map((ticket) => {
        const status = ticket.status === "open" ? "🟢 Ouvert" : "🔴 Fermé";
        const channel =
          message.guild.channels.cache.get(String(ticket.channelId)) ||
          `\`${ticket.channelId}\``;
        return `• ${status} — ${channel} — <@${ticket.userId}>`;
      });

      const container = new ContainerBuilder()
        .setAccentColor(0x00ff00)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## Vos tickets (${tickets.length})`),
        )
        .addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small),
        )
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(lines.join("\n")))
        .addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small),
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `-# Détail d'un ticket : \`!ticketlog <id>\` • Fermeture : \`!close\``,
          ),
        );
      await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error("Erreur dans tickets:", error);
      message.reply("Une erreur est survenue lors de la récupération des tickets.");
    }
  },
};

module.exports = [ticketCommand, ticketsCommand];
