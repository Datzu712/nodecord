import { BaseExecuteOptions } from '../execute-options.js';

export interface AutocompleteExecuteOptions extends BaseExecuteOptions {
    kind: 'autocomplete';
    /**
     * The names of the focused options that triggered the autocomplete interaction. This comes from the arguments of @Autocomplete(...options) decorator on the method
     */
    targetOptions: (string | number | boolean)[];
}
