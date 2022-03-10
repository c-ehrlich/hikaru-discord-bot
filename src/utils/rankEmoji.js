function rankEmoji(rank) {
  if (rank === 1) {
    return '👑';
  }
  return rank;
}

module.exports = { rankEmoji };
