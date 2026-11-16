import { ExecutionKind } from '../constants/execution-kind.js';
import type { AutocompleteChoice, ChatInputOption } from '../interfaces/interactions/autocomplete.js';
import type { AdapterTypes } from '../interfaces/adapter/adapter-types.js';
import { InteractionContext } from './interaction-context.js';

export abstract class AutocompleteContext<T extends AdapterTypes = AdapterTypes> extends InteractionContext<T> {
    constructor(name: string, raw: unknown) {
        super(name, ExecutionKind.AUTOCOMPLETE, raw);
    }

    // Note: technically is redundant to have a dedicated "getFocusedOption" method because in run time we already know
    // what option we want to retrieve while running the autocomplete flow so I might remove this option in the future.
    abstract getFocusedOption(): ChatInputOption<T>;
    abstract getOption(name?: string): ChatInputOption<T> | null;

    abstract getOptions(): ChatInputOption<T>[];
    abstract respond(choices: AutocompleteChoice[]): Promise<void>;
}
