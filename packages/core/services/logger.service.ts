import { ConsoleLogger, type logMessage, ConsoleLoggerOptions } from './console-logger';

export type LogLevels =
    | 'log' // common messages
    | 'error' // error messages that don't break the app
    | 'warn' // warning messages
    | 'debug' // detailed messages for debugging
    | 'verbose';

export interface AbstractLogger {
    debug: (message: logMessage, context?: string) => void;
    error: (message: logMessage, context?: string) => void;
    warn: (message: logMessage, context?: string) => void;
    log: (message: logMessage, context?: string) => void;
    verbose: (message: logMessage, context?: string) => void;
    // fatal: (message: logMessage, .context?: string) => void;
}

const defaultLogger = new ConsoleLogger();

export class Logger implements AbstractLogger {
    private static staticInstance?: AbstractLogger;
    protected localInstanceRef?: AbstractLogger;
    protected static logLevels: LogLevels[];

    constructor(private defaultContext?: string, instanceOptions?: ConsoleLoggerOptions) {
        // If theres not a static instance it means that the logger is not initialized, so if we don't have the "instanceOptions" to create a new instance of "ConsoleLogger", we will use the default logger.
        if (!Logger.staticInstance && !instanceOptions) {
            Logger.staticInstance = defaultLogger;

            // But if "instanceOptions" was provided, we will use it to create the new (and unique instance of ConsoleLogger).
        } else if (instanceOptions && !Logger.staticInstance) {
            Logger.staticInstance = new ConsoleLogger({ ...instanceOptions, context: defaultContext });
        }
        // Local instance for this instance of the logger.
        this.localInstanceRef = Logger.staticInstance;
    }

    // Public methods

    public log(message: logMessage, context = this.defaultContext) {
        this.localInstanceRef?.log(message, context);
    }

    public error(message: logMessage, context = this.defaultContext) {
        this.localInstanceRef?.error(message, context);
    }

    public debug(message: logMessage, context = this.defaultContext) {
        this.localInstanceRef?.debug(message, context);
    }

    public verbose(message: logMessage, context = this.defaultContext) {
        this.localInstanceRef?.verbose(message, context);
    }

    public warn(message: logMessage, context = this.defaultContext) {
        this.localInstance?.warn(message, context);
    }

    // Static methods

    static log(message: logMessage, context?: string) {
        this.staticInstance?.log(message, context);
    }

    static error(message: logMessage, context?: string) {
        this.staticInstance?.error(message, context);
    }

    static debug(message: logMessage, context?: string) {
        this.staticInstance?.debug(message, context);
    }

    static verbose(message: logMessage, context?: string) {
        this.staticInstance?.verbose(message, context);
    }

    static warn(message: logMessage, context?: string) {
        this.staticInstance?.warn(message, context);
    }

    get localInstance() {
        return this.localInstanceRef;
    }

    static overrideLocalInstance(instance: ConsoleLogger | AbstractLogger) {
        Logger.staticInstance = instance;
    }
}
