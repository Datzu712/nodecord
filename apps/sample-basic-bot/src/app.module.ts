import { Module } from '@nodecord/core';
import { AdminModule } from './bot/modules/admin/admin.module';
import { LoggerModule } from './bot/modules/logger/logger.module';
import { UtilModule } from './bot/modules/util/util.module';

@Module({
    imports: [LoggerModule, AdminModule, UtilModule],
})
export class MainModule {}
