const { SlashCommandBuilder } = require('@discordjs/builders');
const { HikaruUser } = require('../schema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('progress')
    .setDescription('View progress')
    .addUserOption((option) =>
      option.setName('user').setDescription('User').setRequired(false)
    ),
  async execute(interaction) {
    // determine if we should get progress for interaction user or user provided in args
    let userQuery = interaction.options.getUser('user');
    if (!userQuery) {
      userQuery = interaction.user;
    }

    // try to find user
    const user = await HikaruUser.findOne({
      discordId: userQuery.id,
    }).exec();
    if (!user) {
      await interaction.reply(
        `It seems like ${userQuery.username}#${userQuery.discriminator} hasn't logged any videos.`
      );
    }

    // get number of videos watched
    const videosWatched = user.watched.length;

    await interaction.reply(
      `${interaction.user.username}#${interaction.user.discriminator} has watched ${videosWatched} videos.`
    );
  },
};
