import { AUTOCOMPLETE_ENTRIES_METADATA } from '../constants/handler.js';

export function Autocomplete(...options: string[]): MethodDecorator {
    return (target, key) => {
        /**
         * This should be stored like this:
         *
         * [
         *   ['methodA', ['option1', 'option2']],
         *   ['methodB', ['option3', 'option4']]
         * ]
         */
        const entries =
            (Reflect.getMetadata(AUTOCOMPLETE_ENTRIES_METADATA, target.constructor) as [string, string[]][]) || [];

        const existing = entries.find(([k]) => k === key);

        if (existing) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [_unused, optionNames] = existing;
            optionNames.push(...options);
        } else {
            entries.push([key.toString(), options]);
        }

        // we don't store the metadata in the key method namespace because there is not a way to infer the method name in runtime without a explicit contract.
        // so its better just to store it in the constructor
        Reflect.defineMetadata(AUTOCOMPLETE_ENTRIES_METADATA, entries, target.constructor);
    };
}
