import { Category } from '@nodecord/core';

import { PingCommand } from './commands/ping.command';
import { PingSlashCommand } from './slashCommands/ping.command';
import { StatsSlashCommand } from './slashCommands/embed.command';

@Category({
    metadata: {
        name: 'util',
    },
    commands: [PingCommand, PingSlashCommand, StatsSlashCommand],
})
export class UtilityCategory {}
