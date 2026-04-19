import { Module } from '@nodecord/core';
import { LoggerModule } from '../logger/logger.module.js';
import { AdminService } from './admin.service.js';
import { PingCommand } from './ping.command.js';
import { PingService } from './ping.service.js';
import { StatusCommand } from './status.command.js';

@Module({
    imports: [LoggerModule],
    providers: [PingService, AdminService],
    handlers: [PingCommand, StatusCommand],
})
export class BotModule {}
