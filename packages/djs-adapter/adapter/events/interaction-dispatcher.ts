import { CommandExecutor, InteractionContext, Listener, ListenerProvider } from '@nodecord/core';
import { ClientEvents, Events, type Interaction as DjsInteraction } from 'discord.js';
import { DjsAutocompleteContext } from '../context/autocomplete-context.js';
import { DjsChatInputCommandContext } from '../context/chat-input-command-context.js';
import { DjsContextMenuContext } from '../context/context-menu-context.js';

@Listener(Events.InteractionCreate)
export class InteractionDispatcher implements ListenerProvider<ClientEvents[Events.InteractionCreate]> {
    constructor(private readonly executor: CommandExecutor) {}

    async handler(raw: DjsInteraction): Promise<void> {
        const ctx = this.mapInteraction(raw);
        if (!ctx) return;
        await this.executor.execute(ctx);
    }

    private mapInteraction(raw: DjsInteraction): InteractionContext | undefined {
        if (raw.isChatInputCommand()) return new DjsChatInputCommandContext(raw);
        if (raw.isAutocomplete()) return new DjsAutocompleteContext(raw);
        if (raw.isUserContextMenuCommand() || raw.isMessageContextMenuCommand()) return new DjsContextMenuContext(raw);
        return undefined;
    }
}
