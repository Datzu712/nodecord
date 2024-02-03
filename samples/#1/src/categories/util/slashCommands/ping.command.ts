import { SlashCommand, ICommand } from '@nodecord/core';
import { pingSlashOptions } from './options/ping.options';

@SlashCommand({
    name: 'ping',
    options: pingSlashOptions,
    global: true,
})
export class PingSlashCommand implements ICommand {
    execute() {
        return 'Pong!';
    }
}
