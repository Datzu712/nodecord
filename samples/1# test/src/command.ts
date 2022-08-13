import 'reflect-metadata';
import { Command, ICommand, Message } from '@nodecord/common';

@Command({
    name: 'ping',
    group: 'general',
})
export class PingCommand implements ICommand {
    execute(@Message('test') message: object, @Message() xd: string) {
        message;
        xd;
        return 'hola';
    }
}
