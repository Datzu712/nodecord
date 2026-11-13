import { CommandHandler, DeferReply, Inject, SlashCommand } from '@nodecord/core';
import { LoggerService } from '../logger/logger.service.js';

@SlashCommand({ name: 'status', description: 'Shows bot status' })
export class StatusCommand implements CommandHandler {
    constructor(@Inject(LoggerService) private readonly logger: LoggerService) {}

    @DeferReply()
    execute(): string {
        this.logger.log('StatusCommand executed');
        return 'Bot is online';
    }
}
