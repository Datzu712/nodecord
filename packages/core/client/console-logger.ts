import { inspect } from 'util';
import type { AbstractLogger, logMessage } from '../interfaces/common/abstract-logger.js';

type LogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose';

export class ConsoleLogger implements AbstractLogger {
    constructor(private context?: string) {}

    log(message: logMessage, context = this.context) {
        this.write('log', message, context);
    }

    error(message: logMessage, context = this.context) {
        this.write('error', message, context);
    }

    warn(message: logMessage, context = this.context) {
        this.write('warn', message, context);
    }

    debug(message: logMessage, context = this.context) {
        this.write('debug', message, context);
    }

    verbose(message: logMessage, context = this.context) {
        this.write('verbose', message, context);
    }

    private write(level: LogLevel, message: logMessage, context?: string): void {
        const timestamp = new Date().toISOString();
        const ctx = context ? ` [${context}]` : '';
        const msg = typeof message === 'string' ? message : inspect(message, { depth: null });
        const out = `${timestamp} ${level.toUpperCase().padEnd(7)}${ctx} ${msg}\n`;

        if (level === 'error') {
            process.stderr.write(out);
        } else {
            process.stdout.write(out);
        }
    }
}