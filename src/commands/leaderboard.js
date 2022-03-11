const { rankEmoji } = require('../utils/rankEmoji');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { HikaruUser, MonthlyViews } = require('../schema');
const { getTextMonth } = require('../utils/getTextMonth');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Leaderboard - submit without year/month for all-time')
    .addIntegerOption((option) =>
      option
        .setName('year')
        .setDescription('Year')
        .setRequired(false)
        .setMinValue(2021)
    )
    .addIntegerOption((option) =>
      option
        .setName('month')
        .setDescription('Month')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(12)
    ),
  async execute(interaction) {
    let reply = 'LOGIC ERROR';

    let year = interaction.options.getInteger('year');
    const month = interaction.options.getInteger('month');

    /**
     * Get all time result
     */
    if (!year && !month) {
      // find top users
      const users = await HikaruUser.find({}).sort('-total').limit(10).exec();

      reply = 'All-time Leaderboard:\n```';

      users.forEach((user) => {
        user.discord = interaction.client.users.cache.get(user.discordId);
      });

      users.forEach((user, index) => {
        reply += `${rankEmoji(index + 1)}: ${user.discord.username}#${
          user.discord.discriminator
        } - ${user.total}\n`;
      });

      reply += '```';
    }

    /**
     * Get one year's result
     */
    if (year && !month) {
      if (year > new Date().getFullYear()) {
        return await interaction.reply(
          `We're not in ${year} yet. Be patient...`
        );
      }

      reply = `Leaderboard for ${year}\n\`\`\``;

      const query = await MonthlyViews.find({
        month: { $gte: 12 * year + 1, $lte: 12 * (year + 1) },
      });
      const data = {};

      query.forEach((item) => {
        if (!data[item.discordId]) {
          data[item.discordId] = 0;
        }
        data[item.discordId] += item.watched;
      });

      console.log(data);

      const mappedHash = Object.keys(data)
        .sort((a, b) => {
          return data[b].watched - data[a].watched;
        })
        .map((item) => ({
          discordId: item,
          watched: data[item],
        }));

      if (mappedHash.length === 0) {
        return await interaction.reply(
          `Looks like there is no data for ${year}`
        );
      }

      mappedHash.forEach((item) => {
        item.discord = interaction.client.users.cache.get(item.discordId);
      });

      mappedHash.forEach((item, index) => {
        reply += `${rankEmoji(index + 1)}: ${item.discord.username}#${
          item.discord.discriminator
        } - ${item.watched}\n`;
      });

      reply += '```';

      return await interaction.reply(reply);
    }

    /**
     * If the user provides a month but not a year,
     * give data for the newest valid month (ie either this year,
     * or last year if that month is still in the future)
     */
    if (month && !year) {
      const date = new Date();
      year = date.getFullYear();

      // Date() months are 0-11, user input months are 1-12
      if (date.getMonth() + 1 > month) {
        year -= 1;
      }
    }

    /**
     * Get one month's result
     */
    if (year && month) {
      reply = `Leaderboard for ${getTextMonth(month)} ${year}\n\`\`\``;

      const searchMonth = 12 * year + month;

      const data = await MonthlyViews.find({ month: searchMonth })
        .sort('-watched')
        .limit(10)
        .exec();

      if (data.length === 0) {
        return await interaction.reply(
          `Looks like there is no data for ${getTextMonth(month)} ${year}`
        );
      }

      data.forEach((item) => {
        item.discord = interaction.client.users.cache.get(item.discordId);
      });

      data.forEach((item, index) => {
        reply += `${rankEmoji(index + 1)}: ${item.discord.username}#${
          item.discord.discriminator
        } - ${item.watched}\n`;
      });

      reply += '```';
    }

    return await interaction.reply(reply);
  },
};
