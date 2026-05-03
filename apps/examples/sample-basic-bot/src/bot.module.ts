import { Module } from '@nodecord/core';
import { AdminModule } from './bot/modules/admin/admin.module.js';
import { LoggerModule } from './bot/modules/logger/logger.module.js';
import { UtilModule } from './bot/modules/util/util.module.js';
import { ReadyListener } from './bot/events/ready.listener.js';
import { LatencyInterceptor } from './bot/interceptors/latency.interceptor.js';

@Module({
    imports: [LoggerModule, AdminModule, UtilModule],
    providers: [LatencyInterceptor],
    listeners: [ReadyListener],
})
export class BotModule {}
