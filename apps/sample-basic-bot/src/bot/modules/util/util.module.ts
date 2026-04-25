import { Module } from '@nodecord/core';

import { StatusCommand } from './status.command.js';
import { PingCommand } from './ping.command.js';
import { LoggerModule } from '../logger/logger.module.js';

@Module({
    imports: [LoggerModule],
    handlers: [StatusCommand, PingCommand],
    providers: [],
})
export class UtilModule {}
