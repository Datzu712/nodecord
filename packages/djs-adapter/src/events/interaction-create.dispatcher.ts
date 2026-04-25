import { CommandExecutor, ExecutionContext, HandlerTypes, Listener, ListenerProvider } from '@nodecord/core';
import { ClientEvents, Events, type Interaction as DjsInteraction } from 'discord.js';
import { CommandRegistry } from '../command-registry.js';

@Listener(Events.InteractionCreate)
export class InteractionCreateDispatcher implements ListenerProvider<ClientEvents[Events.InteractionCreate]> {
    constructor(
        private readonly registry: CommandRegistry,
        private readonly executor: CommandExecutor,
    ) {}

    // Sadly typescript doesn't infer the tuple type for the event args, so we have to hardcode it here
    handler(raw: DjsInteraction): void {
        const ctx = this.mapInteraction(raw);
        if (!ctx) return;

        const registeredCommand = this.registry.get(ctx.name);
        if (registeredCommand) {
            void this.executor.execute(ctx, registeredCommand.handler);
        }
    }

    /**
     * Maps a discord.js Interaction to the framework's ExecutionContext.
     * The raw interaction is passed through so handlers can access it via parameter decorators.
     * Returns undefined for interaction types not yet supported by the framework.
     */
    private mapInteraction(raw: DjsInteraction): ExecutionContext<DjsInteraction> | undefined {
        if (raw.isChatInputCommand()) {
            return new ExecutionContext(raw.commandName, HandlerTypes.SLASH, raw);
        }

        if (raw.isUserContextMenuCommand() || raw.isMessageContextMenuCommand()) {
            return new ExecutionContext(raw.commandName, HandlerTypes.CONTEXT_MENU, raw);
        }

        return undefined;
    }
}
