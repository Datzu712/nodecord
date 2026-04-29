import { Author, CommandHandler, Context, ExecutionContext, SlashCommand } from '@nodecord/core';
import { ChatInputCommandInteraction, SlashCommandBuilder, User } from 'discord.js';

@SlashCommand(new SlashCommandBuilder().setName('ping').setDescription('Replies with pong'))
export class PingCommand implements CommandHandler {
    constructor() {}

    async execute(
        @Context({ passThrough: true }) ctx: ExecutionContext<ChatInputCommandInteraction>,
        @Author() author: User,
    ) {
        const interaction = ctx.getRaw();
        await interaction.deferReply();

        await new Promise((resolve) => setTimeout(resolve, 1000));

        await interaction.editReply(`Pong! Hello, ${author.username}!`);
    }
}
