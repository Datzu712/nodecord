import { Module } from '@nodecord/core';
import { LoggerModule } from '../logger/logger.module.js';
import { AdminService } from './admin.service.js';
import { AdminHandler } from './admin.handler.js';
import { UtilModule } from '../util/util.module.js';

@Module({
    imports: [LoggerModule, UtilModule],
    providers: [AdminService],
    handlers: [AdminHandler],
})
export class AdminModule {}
