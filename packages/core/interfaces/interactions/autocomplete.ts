import type { AdapterTypes } from '../adapter/adapter-types.js';

export interface AutocompleteChoice<T extends string | number = string | number> {
    name: string;
    value: T;
}

/**
 * An option of a chat input command, as the user filled it in.
 */
export interface ChatInputOption<T extends AdapterTypes = AdapterTypes> {
    name: string;

    /** The `ApplicationCommandOptionType` Discord sent. */
    type: number;

    /** The raw value. For entity options (user, role, channel, attachment) this is the id. */
    value: string | number | boolean;

    /**
     * What the adapter's library resolved for this option, if anything. Discord resolves nothing during
     * autocomplete, so there this is always undefined.
     */
    resolved?: T['user'] | T['role'] | T['channel'] | T['attachment'] | undefined;
}
