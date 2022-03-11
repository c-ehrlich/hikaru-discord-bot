function rankEmoji(rank) {
  if (rank === 1) {
    return '👑';
  }

  if (rank > 1 && rank < 10) {
    return ` ${rank}`;
  }
  return rank;
}

module.exports = { rankEmoji };
