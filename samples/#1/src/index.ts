import { NodecordClient } from '@nodecord/core';
import { Client } from './client.module';

(async function () {
    const bot = new NodecordClient(Client, {
        abortOnError: true,
    });
    const pingCommand = bot.commands.get('ping') as any;
    console.log(Reflect.getMetadata('__commandExecutionArguments__', pingCommand.constructor, 'execute'));
})();
