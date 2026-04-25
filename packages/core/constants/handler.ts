// Set by every handler decorator with its CommandTypes value.
// Presence confirms it's a valid handler; value indicates which type (Slash command, context menu interaction, etc).
export const HANDLER_WATERMARK = 'nodecord:handler:watermark';

// Arbitrary metadata for the handler (name, description, options, etc.).
// Shape depends on the handler type.
export const HANDLER_METADATA = 'nodecord:handler:metadata';

// Param metadata stored by parameter decorators on handler methods.
export const COMMAND_ARGS_METADATA = 'nodecord:handler:args';
