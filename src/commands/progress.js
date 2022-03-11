const { SlashCommandBuilder } = require('@discordjs/builders');
const { VideoView } = require('../schema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('progress')
    .setDescription('View progress')
    .addUserOption((option) =>
      option.setName('user').setDescription('User').setRequired(false)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const discordId = user.id;

    const videos = await VideoView.find({ discordId });

    const videosWatched = videos.length;

    await interaction.reply(
      `${user.username}#${user.discriminator} has logged ${videosWatched} videos`
    );
  },
};
