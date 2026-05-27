export const ExecutionKind = {
    // Entrypoints — how a handler is registered and triggered from Discord
    SLASH_COMMAND: 'slashCommand',
    CONTEXT_MENU: 'contextMenu',

    // Sub-interactions — triggered within an entrypoint's flow
    BUTTON: 'button',
    AUTOCOMPLETE: 'autocomplete',
} as const;

export type ExecutionKind = (typeof ExecutionKind)[keyof typeof ExecutionKind];

/**
 * Subset of {@link ExecutionKind} that represents interaction entrypoints — the kinds that map
 * directly to a top-level Discord application command (@SlashCommand, @ContextMenu).
 */
export type EntrypointKind = typeof ExecutionKind.SLASH_COMMAND | typeof ExecutionKind.CONTEXT_MENU;