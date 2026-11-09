const { ContainerBuilder, TextDisplayBuilder, MessageFlags, PermissionFlagsBits } = require("discord.js");
const INVITE_REGEX = /(discord\.gg\/[^\s]+|discordapp\.com\/invite\/[^\s]+|discord\.com\/invite\/[^\s]+)/gi;
const TIMEOUT_DURATION = 60_000;
module.exports = {
  name: "antiInvite",
  description: "Bloque les invitations vers d'autres serveurs",
  run: async (client, message) => {
    if (!message.guild || !message.member || message.author.bot) return;
    if (!INVITE_REGEX.test(message.content || "")) return;
    INVITE_REGEX.lastIndex = 0;
    const me = message.guild.members.me;
    const canDelete = message.channel
      .permissionsFor(me)
      ?.has(PermissionFlagsBits.ManageMessages);
    const canTimeout = message.channel
      .permissionsFor(me)
      ?.has(PermissionFlagsBits.ModerateMembers);
    if (!canDelete) return;
    try {
      await message.delete();
    } catch (error) {
      console.error("[antiInvite] suppression impossible :", error.message);
      return;
    }
    if (canTimeout) {
      await message.member
        .timeout(TIMEOUT_DURATION, "Restreint pour avoir posté une invitation")
        .catch(() => {});
    }
    const container = new ContainerBuilder()
      .setAccentColor(0xff0000)
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`${message.author} a été restreint 60 s pour avoir posté une invitation vers d'autres serveurs.`,));
    await message.channel
      .send({ components: [container], flags: MessageFlags.IsComponentsV2 })
      .catch(() => {});
  },
};