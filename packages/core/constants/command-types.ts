export const CommandParamTypes = {
    CONTEXT: 'CONTEXT',
    GUILD: 'GUILD',
    AUTHOR: 'AUTHOR',
    OPTION: 'OPTION',
    CUSTOM: 'CUSTOM',
} as const;

export type CommandParamTypes = (typeof CommandParamTypes)[keyof typeof CommandParamTypes];
