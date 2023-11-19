// import { Logger } from '../services/logger.service';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const defaultTeardown = (_e: Error): void => process.exit(1);

export class ExceptionCatcher {
    static async asyncRun(fn: () => Promise<any>, teardown = defaultTeardown) {
        try {
            return await fn();
        } catch (error) {
            return teardown(error);
        }
    }

    static run(fn: () => unknown, teardown = defaultTeardown) {
        try {
            return fn();
        } catch (error) {
            return teardown(error);
        }
    }
}
