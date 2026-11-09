const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");

const ITEMS = [
  { id: "vip", label: "Ticket VIP", price: 500, aliases: ["ticket vip", "vip", "ticketvip"] },
  { id: "premium", label: "Rôle premium", price: 1000, aliases: ["role premium", "rôle premium", "premium", "rolepremium"] },
  { id: "color", label: "Couleur personnalisée", price: 200, aliases: ["couleur personnalisee", "couleur personnalisée", "couleur", "color"] },
];

function normalize(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function findItem(query) {
  const target = normalize(query);
  if (!target) return null;
  return (
    ITEMS.find((item) => item.aliases.some((alias) => normalize(alias) === target)) ||
    ITEMS.find((item) => normalize(item.label) === target)
  );
}

const shopCommand = {
  name: "shop",
  description: "Affiche la boutique",
  usage: "!shop",
  aliases: ["store", "boutique"],
  cooldown: 5000,
  run: async (client, message, args) => {
    try {
      const lines = ITEMS.map((item) => `• **${item.label}** — ${item.price} pièces`);
      const container = new ContainerBuilder()
        .setAccentColor(0x00ff00)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("## Boutique"))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("Voici la liste des articles disponibles :"),
        )
        .addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small),
        )
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(lines.join("\n")))
        .addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small),
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`Achetez avec \`!buy <article>\` — vérifiez votre solde avec \`!balance\`.`),
        );
      await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error("Erreur dans shop:", error);
      message.reply("Une erreur est survenue lors de l'affichage de la boutique");
    }
  },
};

const buyCommand = {
  name: "buy",
  description: "Achète un article de la boutique",
  usage: "!buy <article>",
  aliases: ["acheter"],
  cooldown: 5000,
  run: async (client, message, args) => {
    try {
      if (!args[0]) {
        return message.reply(
          `Indiquez un article. Articles disponibles : ${ITEMS.map((i) => `\`${i.label}\``).join(", ")}.`,
        );
      }

      const item = findItem(args.join(" "));
      if (!item) {
        return message.reply(
          `Article inconnu. Disponibles : ${ITEMS.map((i) => `\`${i.label}\` (${i.price} pièces)`).join(", ")}.`,
        );
      }

      let user = await client.models.User.findOne({ id: message.author.id });
      if (!user) {
        user = new client.models.User({
          id: message.author.id,
          username: message.author.username,
          discriminator: message.author.discriminator,
          balance: 0,
          inventory: [],
        });
      }

      const balance = Number(user.balance) || 0;
      if (balance < item.price) {
        const container = new ContainerBuilder()
          .setAccentColor(0xff0000)
          .addTextDisplayComponents(new TextDisplayBuilder().setContent("Solde insuffisant"))
          .addSeparatorComponents(new SeparatorBuilder())
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**${item.label}** coûte **${item.price} pièces**.\nVotre solde : **${balance} pièces**.\nGagnez de l'argent avec \`!work\` ou \`!daily\`.`,
            ),
          );
        return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }

      user.balance = balance - item.price;
      const inventory = Array.isArray(user.inventory) ? user.inventory : [];
      inventory.push(item.label);
      user.inventory = inventory;
      await user.save();

      const container = new ContainerBuilder()
        .setAccentColor(0x00ff00)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("Achat effectué"))
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**Article :** ${item.label}\n**Prix :** ${item.price} pièces\n**Nouveau solde :** ${user.balance} pièces`,
          ),
        )
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("Consultez vos articles avec `!inventory`."),
        );
      await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error("Erreur dans buy:", error);
      message.reply("Une erreur est survenue lors de l'achat.");
    }
  },
};

module.exports = [shopCommand, buyCommand];
