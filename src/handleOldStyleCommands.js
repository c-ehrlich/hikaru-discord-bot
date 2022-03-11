module.exports = {
  handleOldStyleCommands: (client) => {
    client.on('messageCreate', async (message) => {
      // tell people who attempt to use '!log' to use '/log' instead
      if (message.content.match(/^!log/)) {
        message.reply(
          'We\'ve stopped using exclamation mark syntax. Please type a message with slash syntax, such as "/log 15-25"'
        );
      }

      // get backlog
      // only executed if '!backlog' is run by a specific user
      // hardcoding this because it will only need to be run once, ever, so no point
      // in putting a nice ui around it
      if (
        message.content === '!backlog' &&
        message.author.id === '190543707592720384'
      ) {
        let stillSearching = true;
        const allMessages = [];
        while (stillSearching) {
          let query = [];
          const messagesTemp = [];

          if (allMessages.length > 0) {
            query = await message.channel.messages.fetch({
              limit: 100,
              before:
                allMessages.length > 0
                  ? allMessages[allMessages.length - 1].id
                  : undefined,
            });
          } else {
            query = await message.channel.messages.fetch({
              limit: 100,
            });
          }

          // put messages in an array, and make sure the the smallest
          // timestamp is at the end
          query.forEach((msg) => {
            messagesTemp.push(msg);
          });
          messagesTemp.sort((a, b) => b.createdTimestamp - a.createdTimestamp);

          // if we get 0 messages (for example the total messages in the channel
          // was divisible by 10), stop getting more messages
          // FIXME this might need more precise error handling in the future - maybe
          // there's another reason why we didn't get any messages...
          if (messagesTemp.length === 0) {
            stillSearching = false;
            continue;
          }

          console.log(
            'end of messagesTemp',
            messagesTemp[messagesTemp.length - 1].id
          );

          if (allMessages.length > 0) {
            if (
              messagesTemp[messagesTemp.length - 1].id ===
              allMessages[allMessages.length - 1].id
            ) {
              stillSearching = false;
            } else {
              allMessages.push(...messagesTemp);
            }
          } else {
            allMessages.push(...messagesTemp);
          }

          console.log(allMessages.length);
        }

        console.log('WE MADE IT OUT OF THE LOOP');
        console.log(
          allMessages.map((msg) => `${msg.author.id}: ${msg.content}`)
        );

        // WE NOW HAVE A LOG OF ALL THE MESSAGES
        // SO WE JUST NEED TO PUT THEM IN THE DATABASE
      }
    });
  },
};
