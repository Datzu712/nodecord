import { SlashCommand, ICommand, Interaction } from '@nodecord/core';
import type { ChatInputCommandInteraction } from 'discord.js';
import { pingSlashOptions } from './options/ping.options';

@SlashCommand({
    name: 'ping',
    options: pingSlashOptions,
})
export class PingSlashCommand implements ICommand {
    execute(@Interaction() interaction: ChatInputCommandInteraction) {
        interaction.reply('Pong!');
    }
}
