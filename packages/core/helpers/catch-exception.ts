import { Logger } from '@nodecord/core';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const defaultTeardown = (_error: Error) => process.exit(1);

export class ExceptionCatcher {
    public static async asyncRun<T>(fn: () => Promise<T>, teardown = defaultTeardown): Promise<T> {
        try {
            return await fn();
        } catch (error) {
            Logger.error(error);

            return teardown(error);
        }
    }

    public static run<T>(fn: () => T, teardown = defaultTeardown): T {
        try {
            return fn();
        } catch (error) {
            Logger.error(error);

            return teardown(error);
        }
    }
}
