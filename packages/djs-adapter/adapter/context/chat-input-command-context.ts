import type { ChatInputCommandInteraction } from 'discord.js';
import { ChatInputCommandContext } from '@nodecord/core';
import type { DeferReplyOptions, InteractionReplyOptions } from '@nodecord/core';

export class DjsChatInputCommandContext extends ChatInputCommandContext {
    constructor(private readonly interaction: ChatInputCommandInteraction) {
        super(interaction.commandName, interaction);
    }

    async reply(options: InteractionReplyOptions): Promise<void> {
        await this.interaction.reply(options);
    }

    async deferReply(options?: DeferReplyOptions): Promise<void> {
        await this.interaction.deferReply(options);
    }

    async editReply(options: InteractionReplyOptions): Promise<void> {
        await this.interaction.editReply(options);
    }

    async followUp(options: InteractionReplyOptions): Promise<void> {
        await this.interaction.followUp(options);
    }
}
