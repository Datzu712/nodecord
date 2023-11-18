import { Logger } from '../services/logger.service';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const defaultTeardown = (_e: Error): void => process.exit(1);

export interface ExceptionCatcherOptions {
    log?: boolean;
}

export class ExceptionCatcher {
    private logger = new Logger('ExceptionCatcher');
    constructor(private options?: ExceptionCatcherOptions) {}

    public async asyncRun(fn: () => Promise<unknown>, teardown = defaultTeardown) {
        try {
            return await fn();
        } catch (error) {
            if (this.options?.log) {
                this.logger.error(error);
            }

            return teardown(error);
        }
    }

    public run(fn: () => unknown, teardown = defaultTeardown) {
        try {
            return fn();
        } catch (error) {
            if (this.options?.log) {
                this.logger.error(error);
            }

            return teardown(error);
        }
    }
}
