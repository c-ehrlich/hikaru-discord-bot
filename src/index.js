// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('path');
const { Client, Collection, Intents } = require('discord.js');
require('dotenv').config();
const token = process.env.DISCORD_TOKEN;
const { handleOldStyleCommands } = require('./handleOldStyleCommands');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.commands = new Collection();
const commandFiles = fs
  .readdirSync(path.resolve(__dirname, 'commands'))
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  // Set a new item in the collection
  // With the same key as the command name and the value as the exported module
  client.commands.set(command.data.name, command);
}

// When the client is ready, run this code (only once)
client.once('ready', () => {
  console.log('Ready!');
});

// React to ! commands
handleOldStyleCommands(client);

// React to slash commands
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: 'There was an error while executing this command!',
      ephameral: true,
    });
  }
});

// Login to Discord with your client's token
client.login(token);
