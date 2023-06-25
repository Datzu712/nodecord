import { Command, ICommand } from '@nodecord/core';

@Command({
    name: 'ping',
})
export class PingCommand implements ICommand {
    execute() {
        return 'hola';
    }
}
// console.log(Reflect.getMetadata('__commandExecutionArguments__', PingCommand, 'execute'));
// console.log(Reflect.getMetadata('__commandMetadata__', PingCommand));
