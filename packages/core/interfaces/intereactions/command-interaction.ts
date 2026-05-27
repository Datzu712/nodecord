export interface BaseMessageResponseOptions {
    content?: string;
}

export interface InteractionReplyOptions extends BaseMessageResponseOptions {
    flags?: any; // todo
}

/**
 * Basic contract to allow nodecord to send responses to interactions without depending on discord.js types in the core package
 * so the adapter should implement this interface by mapping the raw interaction to it, allowing handlers to use the reply and deferReply methods without caring about the underlying library
 * and allowing easy replacement and testing of the adapter layer without affecting the core logic.
 *
 * @link https://docs.discord.com/developers/interactions/receiving-and-responding#interaction-object
 */
export interface CommandInteraction {
    reply(options: InteractionReplyOptions): Promise<void>;
    // todo: add more methods if needed...
}
