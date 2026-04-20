import { Inject, SlashCommand } from '@nodecord/core';
import { LoggerService } from '../logger/logger.service.js';

@SlashCommand({ name: 'status', description: 'Shows bot status', global: true })
export class StatusCommand {
    constructor(@Inject(LoggerService) private readonly logger: LoggerService) {}

    execute(): string {
        this.logger.log('StatusCommand executed');
        return 'Bot is online';
    }
}
