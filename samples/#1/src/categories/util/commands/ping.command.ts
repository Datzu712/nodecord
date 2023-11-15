import { Command, ICommand, Msg } from '@nodecord/core';
import type { Message } from 'discord.js';

@Command({
    name: 'ping',
    aliases: ['p'],
})
export class PingCommand implements ICommand {
    execute(@Msg() message: Message) {
        message.channel.send('Pong!');
    }
}
