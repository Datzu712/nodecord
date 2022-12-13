import { NodecordClient } from '@nodecord/core';
import { Client } from './src/client.module';

(async function () {
    const bot = new NodecordClient(Client, {
        abortOnError: true,
    });
    console.log(bot);
})();
