/**
 * @file index.js
 * @description Main entry point for CLB League Hub Discord Bot
 *
 * Purpose:
 * - Initialize Discord bot client and register slash commands
 * - Handle command interactions and route to appropriate handlers
 * - Manage bot lifecycle (login, ready state, graceful shutdown)
 *
 * Key Responsibilities:
 * - Load and register all commands from /commands directory
 * - Set up event listeners for interactions
 * - Handle command execution with error catching
 * - Provide console feedback for bot status
 *
 * Data Dependencies:
 * - Environment variable: DISCORD_TOKEN (bot authentication)
 * - Command files in /commands directory (auto-loaded)
 *
 * Architecture:
 * - Uses Discord.js v14 with Gateway Intents
 * - Commands stored in client.commands Collection
 * - Supports both execute() and autocomplete() handlers
 */

import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';
import logger from './utils/logger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
  ]
});

client.commands = new Collection();

const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const command = await import(`file://${filePath}`);

  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    logger.info('CommandLoader', `Loaded command: ${command.data.name}`);
  } else {
    logger.warn('CommandLoader', `Command at ${filePath} is missing required "data" or "execute" property`);
  }
}

client.once(Events.ClientReady, readyClient => {
  logger.info('Bot', `Logged in as ${readyClient.user.tag}`);
  logger.info('Bot', `Ready and serving ${client.guilds.cache.size} server(s)`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);

    if (!command) {
      logger.error('CommandHandler', `Command not found: ${interaction.commandName}`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      logger.error('CommandHandler', `Error executing command ${interaction.commandName}`, error);

      const errorMessage = { content: 'There was an error executing this command!', ephemeral: true };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage);
      } else {
        await interaction.reply(errorMessage);
      }
    }
  } else if (interaction.isAutocomplete()) {
    const command = client.commands.get(interaction.commandName);

    if (!command || !command.autocomplete) {
      logger.error('AutocompleteHandler', `Autocomplete handler not found for: ${interaction.commandName}`);
      return;
    }

    try {
      await command.autocomplete(interaction);
    } catch (error) {
      logger.error('AutocompleteHandler', `Error in autocomplete for ${interaction.commandName}`, error);
    }
  }
});

client.on(Events.Error, error => {
  logger.error('DiscordClient', 'Discord client error', error);
});

process.on('unhandledRejection', error => {
  logger.error('Process', 'Unhandled promise rejection', error);
});

client.login(process.env.DISCORD_TOKEN);
