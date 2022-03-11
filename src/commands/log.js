const { SlashCommandBuilder } = require('@discordjs/builders');
const { VideoView } = require('../schema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('log')
    .setDescription('Log videos')
    .addIntegerOption((option) =>
      option
        .setName('start')
        .setDescription('First video watched')
        .setRequired(true)
        .setMinValue(1)
    )
    .addIntegerOption((option) =>
      option
        .setName('end')
        .setDescription('Last video watched')
        .setRequired(true)
        .setMinValue(1)
    ),
  async execute(interaction) {
    const start = interaction.options.getInteger('start');
    const end = interaction.options.getInteger('end');

    const discordId = interaction.user.id;
    const date = new Date();

    const watched = await VideoView.find({ discordId });
    const toCreate = [];

    for (let index = start; index <= end; index++) {
      if (watched.findIndex((item) => item.index === index) === -1) {
        toCreate.push({
          discordId,
          index,
          date,
        });
      }
    }

    await VideoView.insertMany(toCreate);

    const count = watched.length + toCreate.length;

    await interaction.reply(
      `Logged from #${start} to #${end} for ${interaction.user.username}#${interaction.user.discriminator}\n` +
        `Total videos watched: ${count}`
    );
  },
};
