const { ContainerBuilder, TextDisplayBuilder, MessageFlags, PermissionFlagsBits } = require("discord.js");
const MAX_MENTIONS = 5;
const TIMEOUT_DURATION = 60_000;
module.exports = {
  name: "autoMentionSpam",
  description: "Bloque les messages contenant trop de mentions",
  run: async (client, message) => {
    if (!message.guild || !message.member || message.author.bot) return;
    const content = message.content || "";
    const mentions = content.match(/@[^\s@]+/g);
    if (!mentions || mentions.length < MAX_MENTIONS) return;
    const me = message.guild.members.me;
    const canDelete = message.channel.permissionsFor(me)?.has(PermissionFlagsBits.ManageMessages);
    const canTimeout = message.channel.permissionsFor(me)?.has(PermissionFlagsBits.ModerateMembers);
    if (!canDelete) return;
    await message.delete().catch(() => {});
    if (canTimeout) {
      await message.member
        .timeout(TIMEOUT_DURATION, "Spam de mentions")
        .catch(() => {});
    }
    const container = new ContainerBuilder()
      .setAccentColor(0xff0000)
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`${message.author} a été restreint 60 s : spam de mentions (${mentions.length}).`,));
    await message.channel
      .send({ components: [container], flags: MessageFlags.IsComponentsV2 })
      .catch(() => {});
  },
};