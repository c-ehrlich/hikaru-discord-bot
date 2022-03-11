const { SlashCommandBuilder } = require('@discordjs/builders');
const { VideoView } = require('../schema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlog')
    .setDescription('Remove video from log')
    .addIntegerOption((option) =>
      option
        .setName('start')
        .setDescription('First video to remove')
        .setRequired(true)
        .setMinValue(1)
    )
    .addIntegerOption((option) =>
      option
        .setName('end')
        .setDescription('Last video to remove')
        .setRequired(true)
        .setMinValue(1)
    ),
  async execute(interaction) {
    const start = interaction.options.getInteger('start');
    const end = interaction.options.getInteger('end');

    const discordId = interaction.user.id;

    await VideoView.deleteMany({
      discordId,
      index: { $gte: start, $lte: end },
    });

    const watched = await VideoView.find({ discordId });

    await interaction.reply(
      `Removed #${Math.min(start, end)} to #${Math.max(start, end)} from ${
        interaction.user.username
      }#${interaction.user.discriminator}'s log\n` +
        `Total videos watched: ${watched.length}`
    );
  },
};
