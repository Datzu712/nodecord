import { CategoryModule } from '@nodecord/common';

import { PingCommand } from './commands/ping.command';

@CategoryModule({
    metadata: {
        name: 'util',
    },
    commands: [PingCommand],
})
export class UtilityCategory {}
