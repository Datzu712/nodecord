import { ActionRowBuilder, EmbedBuilder, Interaction, type MessageActionRowComponentBuilder } from 'discord.js';
import type { ExecutionContext } from '@nodecord/core';

// TODO: investigate a better approach for handling command return values.
// Current implementation covers the most common cases (string, EmbedBuilder, ActionRowBuilder, InteractionReplyOptions)
// but only handles ChatInputCommandInteraction. A more robust solution should account for
// other interaction types and potentially support a user-extensible resolver system.
export class ResponseHandler {
    async resolve(value: unknown, ctx: ExecutionContext<Interaction>): Promise<void> {
        console.log(value, ctx);
        if (value == null) return;

        const interaction = ctx.getRaw();
        if (!interaction.isChatInputCommand()) return;

        const method = interaction.deferred || interaction.replied ? 'editReply' : 'reply';
        console.log(method);

        if (typeof value === 'string') {
            await interaction[method]({ content: value });
            return;
        }

        if (value instanceof EmbedBuilder) {
            await interaction[method]({ embeds: [value] });
            return;
        }

        if (value instanceof ActionRowBuilder) {
            await interaction[method]({ components: [value as ActionRowBuilder<MessageActionRowComponentBuilder>] });
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await interaction[method](value as any);
    }
}
