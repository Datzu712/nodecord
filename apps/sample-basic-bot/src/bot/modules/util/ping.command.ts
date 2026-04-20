import { Inject, SlashCommand } from '@nodecord/core';
import { LoggerService } from '../logger/logger.service';

@SlashCommand({ name: 'ping', description: 'Replies with pong' })
export class PingCommand {
    constructor(@Inject(LoggerService) private readonly logger: LoggerService) {}

    execute(): string {
        this.logger.log('PingCommand executed');
        return 'pong!';
    }
}
