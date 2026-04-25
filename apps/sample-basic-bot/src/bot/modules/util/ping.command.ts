import { Author, Context, ExecutionContext, Inject, SlashCommand } from '@nodecord/core';
import { ChatInputCommandInteraction, SlashCommandBuilder, User } from 'discord.js';

import { LoggerService } from '../logger/logger.service.js';

@SlashCommand(new SlashCommandBuilder().setName('ping').setDescription('Replies with pong'))
export class PingCommand {
    constructor(@Inject(LoggerService) private readonly logger: LoggerService) {}

    async execute(@Context() ctx: ExecutionContext<ChatInputCommandInteraction>, @Author() author: User) {
        this.logger.log('PingCommand executed');

        await ctx.getRaw().reply(`Pong! Hello, ${author.username}!`);
    }
}
