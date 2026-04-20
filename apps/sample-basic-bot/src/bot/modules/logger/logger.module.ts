import { Module } from '@nodecord/core';
import { LoggerService } from './logger.service';

@Module({
    providers: [LoggerService],
    global: true,
})
export class LoggerModule {}
