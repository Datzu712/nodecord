import { Category } from '@nodecord/core';

import { PingCommand } from './commands/ping.command';
import { PingSlashCommand } from './slashCommands/ping.command';

@Category({
    metadata: {
        name: 'util',
    },
    commands: [PingCommand, PingSlashCommand],
})
export class UtilityCategory {}
