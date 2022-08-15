import { Command, ICommand, Message, type PipeExecutable } from '@nodecord/common';

class MessagePipe implements PipeExecutable {
    async run(message: unknown) {
        return message;
    }
}

@Command({
    name: 'ping',
})
export class PingCommand implements ICommand {
    execute(@Message(MessagePipe) message: object, @Message() xd: string) {
        message;
        xd;
        return 'hola';
    }
}
// console.log(Reflect.getMetadata('__commandExecutionArguments__', PingCommand, 'execute'));
// console.log(Reflect.getMetadata('__commandMetadata__', PingCommand, 'execute'));
