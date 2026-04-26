import { CommandHandler, DeferReply, Inject, SlashCommand } from '@nodecord/core';
import { SlashCommandBuilder } from 'discord.js';

import { LoggerService } from '../logger/logger.service.js';

@SlashCommand(new SlashCommandBuilder().setName('status').setDescription('Shows bot status'))
export class StatusCommand implements CommandHandler {
    constructor(@Inject(LoggerService) private readonly logger: LoggerService) {}

    @DeferReply()
    execute(): string {
        this.logger.log('StatusCommand executed');
        return 'Bot is online';
    }
}
