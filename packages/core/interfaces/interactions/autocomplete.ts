export interface AutocompleteChoice<T extends string | number | boolean = string | number | boolean> {
    name: string;
    value: T;
}

export interface FocusedOption {
    name: string;
    value: string | number | boolean;
    type: number;
}
