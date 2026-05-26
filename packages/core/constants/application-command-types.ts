/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types}
 */
export const ApplicationCommandTypes = {
    /**
     * Slash commands; a text-based command that shows up when a user types `/`
     */
    ChatInput: 1,
    /**
     * A UI-based command that shows up when you right click or tap on a user
     */
    User: 2,
    /**
     * A UI-based command that shows up when you right click or tap on a message
     */
    Message: 3,
    /**
     * A UI-based command that represents the primary way to invoke an app's Activity
     */
    PrimaryEntryPoint: 4,
} as const;

export type ApplicationCommandTypes = (typeof ApplicationCommandTypes)[keyof typeof ApplicationCommandTypes];
