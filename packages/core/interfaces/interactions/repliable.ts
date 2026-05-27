/**
 * Basic contract to allow nodecord to send responses to interactions without depending on discord.js types in the core package
 * so the adapter should implement this interface by mapping the raw interaction to it, allowing handlers to use the reply and deferReply methods without caring about the underlying library direclty
 * and allowing easy replacement and testing of the adapter layer without affecting the core logic.
 *
 */

export interface InteractionReplyOptions {
    content?: string;
}

export interface DeferReplyOptions {}