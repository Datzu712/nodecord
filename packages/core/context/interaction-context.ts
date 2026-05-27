import type { ExecutionKind } from '../constants/execution-kind.js';
import type { ChatInputCommandContext } from './chat-input-command-context.js';
import type { AutocompleteContext } from './autocomplete-context.js';
import type { ContextMenuContext } from './context-menu-context.js';

export class InteractionContext {
    constructor(
        readonly name: string,
        readonly type: ExecutionKind,
        private readonly raw: unknown,
    ) {}

    getRaw<T>(): T {
        return this.raw as T;
    }

    isChatInputCommand(): this is ChatInputCommandContext {
        return this.type === 'slashCommand';
    }

    isAutocomplete(): this is AutocompleteContext {
        return this.type === 'autocomplete';
    }

    isContextMenu(): this is ContextMenuContext {
        return this.type === 'contextMenu';
    }
}
