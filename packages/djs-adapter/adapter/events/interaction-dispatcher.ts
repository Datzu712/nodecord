import { type AbstractLogger, CommandExecutor, InteractionContext, Listener, ListenerProvider } from '@nodecord/core';
import { ClientEvents, Events, type Interaction as DjsInteraction } from 'discord.js';
import { DjsChatInputCommandContext } from '../context/chat-input-command-context.js';
import { DjsAutocompleteContext } from '../context/autocomplete-context.js';
import { DjsContextMenuContext } from '../context/context-menu-context.js';

@Listener(Events.InteractionCreate)
export class InteractionDispatcher implements ListenerProvider<ClientEvents[Events.InteractionCreate]> {
    constructor(executor: CommandExecutor, logger?: AbstractLogger | false) {}

    async handler(raw: DjsInteraction) {
        const ctx = this.mapInteraction(raw);
        if (!ctx) return;
    }
    /**
     * Maps a discord.js Interaction to the framework's InteractionContext.
     * The raw interaction is passed through so handlers can access it via @Ctx.
     * Returns undefined for interaction types not yet supported by the framework.
     */
    private mapInteraction(raw: DjsInteraction): InteractionContext | undefined {
        if (raw.isChatInputCommand()) {
            return new DjsChatInputCommandContext(raw);
        }

        if (raw.isAutocomplete()) {
            return new DjsAutocompleteContext(raw);
        }

        if (raw.isUserContextMenuCommand() || raw.isMessageContextMenuCommand()) {
            return new DjsContextMenuContext(raw);
        }

        return undefined;
    }
}
