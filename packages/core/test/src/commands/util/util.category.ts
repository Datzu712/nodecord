import { Category } from '@nodecord/core';

import { PingCommand } from './commands/ping.command';

@Category({
    metadata: {
        name: 'util',
    },
    commands: [PingCommand],
})
export class UtilityCategory {}
