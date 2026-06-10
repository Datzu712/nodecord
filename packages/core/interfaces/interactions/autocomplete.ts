export interface AutocompleteChoice<T extends string | number = string | number> {
    name: string;
    value: T;
}

export interface ChatInputOption {
    name: string;
    value: string | number | boolean;
    type: number;
}
