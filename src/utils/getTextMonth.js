function getTextMonth(month) {
  if (typeof month !== 'number' || month % 1 !== 0 || month < 1 || month > 12) {
    return 'ERROR NOT A MONTH';
  }

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return months[month - 1];
}

module.exports = { getTextMonth };
