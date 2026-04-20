import { Module } from '@nodecord/core';
import { AdminModule } from './bot/modules/admin/admin.module.js';
import { LoggerModule } from './bot/modules/logger/logger.module.js';
import { UtilModule } from './bot/modules/util/util.module.js';

@Module({
    imports: [LoggerModule, AdminModule, UtilModule],
})
export class MainModule {}
