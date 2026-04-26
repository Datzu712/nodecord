// Set by every handler decorator with its CommandTypes value.
// Presence confirms it's a valid handler; value indicates which type (Slash command, context menu interaction, etc).
export const HANDLER_WATERMARK = 'nodecord:handler:watermark';

// Arbitrary metadata for the handler (name, description, options, etc.).
// Shape depends on the handler type.
export const HANDLER_METADATA = 'nodecord:handler:metadata';

// Param metadata stored by parameter decorators on handler methods.
export const COMMAND_ARGS_METADATA = 'nodecord:handler:args';

// List of interceptor constructors set by @UseInterceptors on a handler class.
export const USE_INTERCEPTORS_METADATA = 'nodecord:handler:use-interceptors';

// Set by @DeferReply on the execute method to signal that deferReply() should be called automatically.
export const DEFER_REPLY_METADATA = 'nodecord:handler:defer-reply';
