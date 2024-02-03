import { Command, ICommand } from '@nodecord/core';

@Command({
    name: 'ping',
    aliases: ['p'],
})
export class PingCommand implements ICommand {
    execute() {
        return 'pong!';
    }
}
