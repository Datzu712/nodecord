import { Module } from '@nodecord/core';

import { StatusCommand } from './status.command.js';
import { PingCommand } from './ping.command.js';
import { ServerInfoCommand } from './server-info.command.js';
import { SearchCommand } from './search.command.js';
import { LoggerModule } from '../logger/logger.module.js';
import { CommandAuditInterceptor } from '../../interceptors/command-audit.interceptor.js';
import { StringToEmbedInterceptor } from '../../interceptors/string-to-embed.interceptor.js';

@Module({
    imports: [LoggerModule],
    handlers: [StatusCommand, PingCommand, ServerInfoCommand, SearchCommand],
    providers: [CommandAuditInterceptor, StringToEmbedInterceptor],
})
export class UtilModule {}
