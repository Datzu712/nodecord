import { Module } from '@nodecord/core';
import { LoggerModule } from '../logger/logger.module';
import { AdminService } from './admin.service';
import { AdminHandler } from './admin.handler';
import { UtilModule } from '../util/util.module';

@Module({
    imports: [LoggerModule, UtilModule],
    providers: [AdminService],
    handlers: [AdminHandler],
})
export class AdminModule {}
