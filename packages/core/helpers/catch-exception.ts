import { Logger } from '@nodecord/core';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const defaultTeardown = (_e: Error): void => process.exit(1);

export class ExceptionCatcher {
    public static async asyncRun(fn: () => Promise<unknown>, teardown = defaultTeardown) {
        try {
            return await fn();
        } catch (error) {
            Logger.error(error);

            return teardown(error);
        }
    }

    public static run(fn: () => unknown, teardown = defaultTeardown) {
        try {
            return fn();
        } catch (error) {
            Logger.error(error);

            return teardown(error);
        }
    }
}
