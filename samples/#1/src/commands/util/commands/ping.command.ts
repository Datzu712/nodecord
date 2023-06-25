import { Command, ICommand, Msg, type PipeExecutable } from '@nodecord/core';
import type { Message } from 'discord.js';

class MessagePipe implements PipeExecutable {
    async run(message: unknown) {
        return message;
    }
}
MessagePipe;
@Command({
    name: 'ping',
    aliases: ['p'],
})
export class PingCommand implements ICommand {
    execute(@Msg() message: Message) {
        message.channel.send('Pong!');

        return 'hola';
    }
}
// console.log(Reflect.getMetadata('__commandExecutionArguments__', PingCommand, 'execute'));
//console.log(Reflect.getMetadata('__commandMetadata__', PingCommand));
