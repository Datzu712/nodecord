import type { AbstractLogger } from '../../services/logger.service';

export interface NodecordClientOptions {
    /**
     * Specifies the logger to use. Pass `false` to turn off logging.
     *
     * By default, we will use our logger with the basic configuration. If you want to enable the saving logs in files options
     * you should import the class `Logger` of `@nodecord/core`, instance it and pass it in this property.
     */
    logger?: AbstractLogger | false;

    /**
     * Pass true if you want that when any error occurs within the client, it will be closed.
     */
    abortOnError?: boolean;

    /**
     * This prefix only works for messages-based commands (legacy commands).
     */
    prefix?: string[] | string;
}
