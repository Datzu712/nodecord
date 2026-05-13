import {
    type AbstractLogger,
    CommandExecutor,
    ExecutionContext,
    HandlerTypes,
    Listener,
    ListenerProvider,
    RegisteredExceptionHandler,
} from '@nodecord/core';
import { ClientEvents, Events, type Interaction as DjsInteraction } from 'discord.js';
import { CommandRegistry, DjsRegisteredCommand } from '../command-registry.js';
import { ResponseHandler } from '../response-handler.js';
import { CommandInteractionFlow } from './flows/command.flow.js';
import { AutocompleteInteractionFlow } from './flows/autocomplete.flow.js';
import { DefaultInteractionExceptionHandler } from './flows/default-interaction-exception.handler.js';

@Listener(Events.InteractionCreate)
export class InteractionDispatcher implements ListenerProvider<ClientEvents[Events.InteractionCreate]> {
    private readonly commandFlow: CommandInteractionFlow;
    private readonly responseHandler = new ResponseHandler();
    private readonly autocompleteFlow: AutocompleteInteractionFlow;
    private readonly defaultExceptionHandler: RegisteredExceptionHandler;

    constructor(
        private readonly registry: CommandRegistry,
        executor: CommandExecutor,
        logger?: AbstractLogger | false,
    ) {
        this.commandFlow = new CommandInteractionFlow(executor, this.responseHandler);
        this.autocompleteFlow = new AutocompleteInteractionFlow(executor);
        this.defaultExceptionHandler = DefaultInteractionExceptionHandler.asRegistered(logger);
    }

    // Sadly typescript doesn't infer the tuple type for the event args, so we have to hardcode it here
    async handler(raw: DjsInteraction) {
        debugger;
        const ctx = this.mapInteraction(raw);
        if (!ctx) return;

        const cmd = this.registry.get(ctx.name);
        if (!cmd) return;

        const cmdWithDefaults = this.withExceptionFallback(cmd);
        if (raw.isAutocomplete()) {
            return this.autocompleteFlow.handle(raw, ctx, cmdWithDefaults);
        }

        return this.commandFlow.handle(raw, ctx, cmdWithDefaults);
    }

    private withExceptionFallback(cmd: DjsRegisteredCommand): DjsRegisteredCommand {
        return {
            ...cmd,
            exceptionHandlers: [...cmd.exceptionHandlers, this.defaultExceptionHandler],
        };
    }

    /**
     * Maps a discord.js Interaction to the framework's ExecutionContext.
     * The raw interaction is passed through so handlers can access it via parameter decorators.
     * Returns undefined for interaction types not yet supported by the framework.
     */
    private mapInteraction(raw: DjsInteraction): ExecutionContext | undefined {
        if (raw.isChatInputCommand()) {
            return new ExecutionContext(raw.commandName, HandlerTypes.SLASH, raw);
        }

        if (raw.isAutocomplete()) {
            return new ExecutionContext(raw.commandName, HandlerTypes.AUTOCOMPLETE, raw);
        }

        if (raw.isUserContextMenuCommand() || raw.isMessageContextMenuCommand()) {
            return new ExecutionContext(raw.commandName, HandlerTypes.CONTEXT_MENU, raw);
        }

        return undefined;
    }
}
