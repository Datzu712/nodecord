import { Command, ICommand, Message, type PipeExecutable } from '@nodecord/core';

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
    execute(@Message() message: object, @Message() xd: string) {
        message;
        xd;
        return 'hola';
    }
}
// console.log(Reflect.getMetadata('__commandExecutionArguments__', PingCommand, 'execute'));
//console.log(Reflect.getMetadata('__commandMetadata__', PingCommand));
