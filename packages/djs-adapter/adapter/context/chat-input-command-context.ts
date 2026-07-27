import type { APIGuild, APIUser, ChatInputCommandInteraction } from 'discord.js';
import { ChatInputCommandContext } from '@nodecord/core';
import type { ChatInputOption, DeferReplyOptions, InteractionReplyOptions } from '@nodecord/core';

export class DjsChatInputCommandContext extends ChatInputCommandContext {
    constructor(private readonly interaction: ChatInputCommandInteraction) {
        super(interaction.commandName, interaction);
    }

    getOptions(): ChatInputOption[] {
        return this.interaction.options.data.map((opt) => ({
            name: opt.name,
            value: opt.value as string | number | boolean,
            type: opt.type,
        }));
    }

    getGuild(): APIGuild | null {
        const guild = this.interaction.guild;
        if (!guild) return null;
        return { id: guild.id, name: guild.name } as APIGuild;
    }

    getAuthor(): APIUser {
        const user = this.interaction.user;
        return {
            id: user.id,
            username: user.username,
            discriminator: user.discriminator,
            avatar: user.avatar,
        } as APIUser;
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
