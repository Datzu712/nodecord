export interface CommandMetadata {
    metadata: {
        name: string;
        description: string;
        aliases?: string[];
        execute?: (...args: unknown[]) => unknown;
        category?: string;
    };
}
