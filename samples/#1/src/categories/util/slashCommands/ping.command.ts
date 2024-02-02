import { SlashCommand, ICommand, Context } from '@nodecord/core';
import type { ChatInputCommandInteraction } from 'discord.js';
import { pingSlashOptions } from './options/ping.options';

@SlashCommand({
    name: 'ping',
    options: pingSlashOptions,
    global: true,
})
export class PingSlashCommand implements ICommand {
    execute(@Context() interaction: ChatInputCommandInteraction) {
        interaction.reply('Pong!');
    }
}
