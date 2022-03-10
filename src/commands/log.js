const { SlashCommandBuilder } = require('@discordjs/builders');
const { HikaruUser } = require('../schema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('log')
    .setDescription('Log multiple videos')
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

    // find or create user
    let user = await HikaruUser.findOne({
      discordId: interaction.user.id,
    }).exec();
    if (!user) {
      user = await HikaruUser.create({ discordId: interaction.user.id });
    }

    // update watched list
    const watched = [...user.watched];
    for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
      if (watched.indexOf(i) === -1) {
        watched.push(i);
      }
    }
    user.watched = watched;
    user.save();

    await interaction.reply(
      `Logged from #${start} to #${end} for ${interaction.user.username}#${interaction.user.discriminator}\n` +
        `Total videos watched: ${user.watched.length}`
    );
  },
};
