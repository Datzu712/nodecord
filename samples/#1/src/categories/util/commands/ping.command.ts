import { Command, ICommand, Context } from '@nodecord/core';
import type { Message } from 'discord.js';

@Command({
    name: 'ping',
    aliases: ['p'],
})
export class PingCommand implements ICommand {
    execute(@Context() message: Message) {
        console.log(message);
        message.channel.send('Pong!');
    }
}
