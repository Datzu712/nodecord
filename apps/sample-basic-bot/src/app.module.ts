import { Module } from '@nodecord/core';
import { BotModule } from './bot/bot.module.js';
import { LoggerModule } from './logger/logger.module.js';

@Module({
    imports: [LoggerModule, BotModule],
})
export class MainModule {}
