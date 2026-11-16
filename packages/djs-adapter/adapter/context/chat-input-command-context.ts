import type { ChatInputCommandInteraction, Guild, User } from 'discord.js';
import { ChatInputCommandContext } from '@nodecord/core';
import type { ChatInputOption, DeferReplyOptions, InteractionReplyOptions } from '@nodecord/core';
import type { DjsTypes } from '../djs-types.js';

export class DjsChatInputCommandContext extends ChatInputCommandContext<DjsTypes> {
    constructor(private readonly interaction: ChatInputCommandInteraction) {
        super(interaction.commandName, interaction);
    }

    getOptions(): ChatInputOption<DjsTypes>[] {
        return this.interaction.options.data.map((opt) => ({
            name: opt.name,
            value: opt.value as string | number | boolean,
            type: opt.type,
            resolved: opt.user ?? opt.role ?? opt.channel ?? opt.attachment,
        }));
    }

    getGuild(): Guild | null {
        return this.interaction.guild;
    }

    getAuthor(): User {
        return this.interaction.user;
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
