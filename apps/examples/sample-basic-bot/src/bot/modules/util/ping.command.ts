import { Author, ChatInputCommandContext, CommandHandler, Context, SlashCommand } from '@nodecord/core';
import { User } from 'discord.js';

@SlashCommand({ name: 'ping', description: 'Replies with pong' })
export class PingCommand implements CommandHandler {
    constructor() {}

    async execute(@Context({ passThrough: true }) ctx: ChatInputCommandContext, @Author() author: User) {
        await ctx.deferReply();

        await new Promise((resolve) => setTimeout(resolve, 1000));

        await ctx.editReply({ content: `Pong! Hello, ${author.username}!` });
    }
}
