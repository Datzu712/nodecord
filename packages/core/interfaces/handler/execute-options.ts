import type { AutocompleteExecuteOptions } from './executions/autocomplete.js';
import type { ButtonExecuteOptions } from './executions/button.js';
import type { ContextMenuExecuteOptions } from './executions/context-menu.js';
import type { SlashCommandExecuteOptions } from './executions/slash-command.js';
import type { ParamMetadata } from './param-metadata.js';

export interface BaseExecuteOptions {
    /**
     * The kind of interaction this method handles within the handler's interaction flow.
     * Unlike {@link HandlerMetadata.type} which defines the entry point, kind defines
     * what specific interaction this executor responds to (e.g. a slash command may have
     * separate executors for the command itself, its autocomplete, modals, buttons, etc).
     *
     * For example, a paginated command may have its entry point as a slash command that renders
     * buttons, and separate executors handling each button interaction, all living within the same handler.
     */
    //kind: ExecutionKind;

    /**
     * If true, the framework won't attempt to respond to the interaction in any way
     * (reply, followUp, autocomplete.respond, etc), leaving full control to the handler.
     * This comes from the param decorator @Ctx({ passThrough: true }).
     */
    passThrough: boolean;

    params: ParamMetadata[];
}

export interface RepliableExecuteOptions extends BaseExecuteOptions {
    defer: boolean;
    ephemeral: boolean;
}

export type ExecuteOptions =
    | ContextMenuExecuteOptions
    | AutocompleteExecuteOptions
    | SlashCommandExecuteOptions
    | ButtonExecuteOptions;
