const { rankEmoji } = require('../utils/rankEmoji');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { HikaruUser } = require('../schema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('All-time leaderboard'),
  async execute(interaction) {
    // find top users
    const users = await HikaruUser.find({}).sort('total').limit(10).exec();

    let reply = 'All-time Leaderboards:\n```';

    users.forEach((user) => {
      user.discord = interaction.client.users.cache.get(user.discordId);
      console.log(user.discord);
    });

    users.forEach((user, index) => {
      reply += `${rankEmoji(index + 1)}: ${user.discord.username}#${user.discord.discriminator} - ${user.total}`;
    });

    reply += '```';

    console.log(users);

    await interaction.reply(reply);
  },
};
