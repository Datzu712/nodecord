import type { APIGuild, APIUser, ContextMenuCommandInteraction } from 'discord.js';
import { ContextMenuContext } from '@nodecord/core';
import type { DeferReplyOptions, InteractionReplyOptions } from '@nodecord/core';

export class DjsContextMenuContext extends ContextMenuContext {
    constructor(private readonly interaction: ContextMenuCommandInteraction) {
        super(interaction.commandName, interaction);
    }

    get deferred(): boolean {
        return this.interaction.deferred;
    }

    get replied(): boolean {
        return this.interaction.replied;
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
}
