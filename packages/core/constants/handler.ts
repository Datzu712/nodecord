/**
 * Set by @SlashCommand or @ContextMenuCommand
 * its presence represents that its a valid handler
 */
export const HANDLER_WATERMARK = 'nodecord:handler:watermark';

/*
 * Metadata key used to store and retrieve Discord command handler information
 * on a class decorators (e.g. @SlashCommand, @ContextMenuCommand).
 */
export const COMMAND_HANDLER_METADATA = 'nodecord:handler:metadata';

/**
 * Params metadata related with a method executor inside a command handler.
 * Stored as ParamMetadata[] on the handler class, keyed by method name via Reflect.
 *
 * @example <caption>Usage with SlashCommand handler</caption>
 * // @SlashCommand(...)
 * // class MyHandler {
 * //   async execute(@Ctx() ctx);
 * //
 * //   @Autocomplete('option1', 'option2')
 * //   async autocomplete(@Guild() guild: Guild, @Option('option1') option: string);
 * // }
 *
 * // Reflect.getMetadata(COMMAND_ARGS_METADATA, MyHandler, 'execute')
 * // => [{ index: 0, type: 'CONTEXT', data: undefined }]
 * //
 * // Reflect.getMetadata(COMMAND_ARGS_METADATA, MyHandler, 'autocomplete')
 * // => [{ index: 0, type: 'GUILD', data: undefined }, { index: 1, type: 'OPTION', data: 'option1' }]
 */
export const COMMAND_ARGS_METADATA = 'nodecord:handler:args';

// List of interceptor constructors set by @UseInterceptors on a handler class.
// note: interceptors might be moved in the future to allow method-level application
export const USE_INTERCEPTORS_METADATA = 'nodecord:handler:use-interceptors';

/**
 * Set by @DeferReply on some executor method to signal that the framework should defer the reply to the interaction when executing that method.
 */
export const DEFER_REPLY_METADATA = 'nodecord:handler:defer-reply';

/**
 * Metadata key used to store the execution options of each method executor within a command handler.
 * Stored as a Map where the key is the method name and the value is the ExecutorMetadata for that method.
 */
export const EXECUTIONS_METADATA = 'nodecord:handler:executions';
