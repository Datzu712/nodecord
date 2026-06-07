export interface AutocompleteChoice<T extends string | number = string | number> {
    name: string;
    value: T;
}

export interface FocusedOption {
    name: string;
    value: string | number;
    type: number;
}
