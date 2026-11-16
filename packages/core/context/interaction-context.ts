import type { ExecutionKind } from '../constants/execution-kind.js';
import type { AdapterTypes } from '../interfaces/adapter/adapter-types.js';
import type { ChatInputCommandContext } from './chat-input-command-context.js';
import type { AutocompleteContext } from './autocomplete-context.js';
import type { ContextMenuContext } from './context-menu-context.js';

export abstract class InteractionContext<T extends AdapterTypes = AdapterTypes> {
    constructor(
        readonly name: string,
        readonly type: ExecutionKind,
        private readonly raw: unknown,
    ) {}

    getRaw<T>(): T {
        return this.raw as T;
    }

    isChatInputCommand(): this is ChatInputCommandContext<T> {
        return this.type === 'slashCommand';
    }

    isAutocomplete(): this is AutocompleteContext<T> {
        return this.type === 'autocomplete';
    }

    isContextMenu(): this is ContextMenuContext<T> {
        return this.type === 'contextMenu';
    }

    /** The guild the interaction happened in, or null (DM, or the library does not have it). */
    abstract getGuild(): T['guild'] | null;

    /** Who triggered the interaction. Always the user, never the guild member. */
    abstract getAuthor(): T['user'];
}
