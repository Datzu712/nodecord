// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type logMessage = any;

export interface AbstractLogger {
    debug: (message: logMessage, context?: string) => void;
    error: (message: logMessage, context?: string) => void;
    warn: (message: logMessage, context?: string) => void;
    log: (message: logMessage, context?: string) => void;
    verbose: (message: logMessage, context?: string) => void;
}
