import { Module } from '@nodecord/core';

import { StatusCommand } from './status.command';
import { PingCommand } from './ping.command';
import { LoggerModule } from '../logger/logger.module';
import { AdminModule } from '../admin/admin.module';

@Module({
    imports: [LoggerModule, AdminModule],
    handlers: [StatusCommand, PingCommand],
    providers: [],
})
export class UtilModule {}
