import { SlashCommandBuilder } from 'discord.js';

export const statsSlashOption = new SlashCommandBuilder()
    .setName('embed')
    .setDescription("Return an embed message with the bot's information.");
