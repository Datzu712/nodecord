import { SlashCommandBuilder } from 'discord.js';

export const statsSlashOption = new SlashCommandBuilder()
    .setName('stats')
    .setDescription("Return an embed message with the bot's information.");
