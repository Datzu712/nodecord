import { ExecutionKind } from '../constants/execution-kind.js';
import type { AutocompleteChoice, FocusedOption } from '../interfaces/interactions/autocomplete.js';
import { InteractionContext } from './interaction-context.js';

export abstract class AutocompleteContext extends InteractionContext {
    constructor(name: string, raw: unknown) {
        super(name, ExecutionKind.AUTOCOMPLETE, raw);
    }

    abstract getFocusedOption(): FocusedOption;
    abstract respond(choices: AutocompleteChoice[]): Promise<void>;
}
