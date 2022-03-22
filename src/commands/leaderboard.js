const { rankEmoji } = require('../utils/rankEmoji');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { VideoView } = require('../schema');
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
    const year = interaction.options.getInteger('year');
    const month = interaction.options.getInteger('month');
    const date = new Date();

    // make sure we're not trying to find data from the future
    if (
      year > date.getFullYear() ||
      (year == date.getFullYear() && month - 1 > date.getMonth())
    ) {
      return await interaction.reply(
        'If I could predict the future I would quit my job as a Discord Bot'
      );
    }

    const data = await findData(year, month);

    if (data.length === 0) {
      return await interaction.reply(noDataFoundString(year, month));
    }

    // get user info for each user in the leaderboard
    // each user's info may or may not be cached
    for (const item of data) {
      let user = interaction.client.users.cache.get(item._id);
      if (!user) {
        user = await interaction.client.users.fetch(item._id);
      }
      item.discord = user;
    }

    const reply = createLeaderboardString(data, year, month);

    return await interaction.reply(reply);
  },
};

function createLeaderboardString(data, year, month) {
  let header = '';
  let body = '';
  if (!year && !month) {
    header = `All-time leaderboard`;
  }

  if (year && !month) {
    header = `Leaderboard for ${year}`;
  }

  if (!year && month) {
    const date = new Date();
    const currentMonth = date.getMonth() + 1;
    year = date.getFullYear();
    if (month > currentMonth) year -= 1;
  }

  if (year & month) {
    header = `Leaderboard for ${getTextMonth(month)} ${year}`;
  }

  data.forEach((item, acc) => {
    console.log(item);
    console.log(
      'adding to leaderboard string:',
      `${rankEmoji(acc + 1)}. ${item.discord.username} - ${item.count}\n`
    );
    body += `${rankEmoji(acc + 1)}. ${item.discord.username} - ${item.count}\n`;
  });

  return `${header}\n\`\`\`${body}\`\`\``;
}

async function findData(year, month) {
  // JavaScript dates count month from 0
  if (month) month -= 1;

  let gte = new Date(0);
  let lt = new Date(3000, 0);

  if (year && !month) {
    gte = new Date(year, 0);
    lt = new Date(year + 1, 0);
  }

  // Set year if user provided a month but not a year
  if (!year && month) {
    year = new Date().getFullYear();
    if (month > new Date().getMonth()) {
      year -= 1;
    }
  }

  if (year && month) {
    gte = new Date(year, month);
    lt = new Date(year, month + 1);
  }

  const data = await VideoView.aggregate([
    { $match: { date: { $gte: gte, $lt: lt } } },
    {
      $group: {
        _id: '$discordId',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]).limit(10);

  return data;
}

function noDataFoundString(year, month) {
  if (!year && !month) {
    return 'Looks like nobody has logged any data yet';
  }

  if (year && !month) {
    return `Looks like there are no logs for ${year}`;
  }

  if (!year && month) {
    const date = new Date();
    const currentMonth = date.getMonth() + 1;
    year = date.getFullYear();
    if (month > currentMonth) year -= 1;
  }

  return `Looks like there are no logs for ${getTextMonth(month)} ${year}`;
}
