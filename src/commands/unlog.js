const { SlashCommandBuilder } = require('@discordjs/builders');
const { HikaruUser } = require('../schema');

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

    // find or create user
    let user = await HikaruUser.findOne({
      discordId: interaction.user.id,
    }).exec();
    if (!user) {
      user = await HikaruUser.create({ discordId: interaction.user.id });
    }

    // update watched list
    let watched = [...user.watched];
    for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
      const index = watched.indexOf(i);
      if (index !== -1) {
        console.log(`removing ${i}`);
        watched = [].concat(watched.slice(0, index), watched.slice(index + 1));
      }
    }
    user.watched = watched;
    user.save();

    await interaction.reply(
      `Removed #${Math.min(start, end)} to #${Math.max(start, end)} from ${interaction.user.username}#${interaction.user.discriminator}'s log\n` +
        `Total videos watched: ${user.watched.length}`
    );
  },
};
