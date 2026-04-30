import { Listener, ListenerProvider } from '@nodecord/core';
import { Events } from 'discord.js';
import { LoggerService } from '../modules/logger/logger.service.js';

@Listener(Events.ClientReady)
export class ReadyListener implements ListenerProvider {
    constructor(private readonly logger: LoggerService) {}

    public handler() {
        this.logger.log('Bot is ready!');
    }
}
