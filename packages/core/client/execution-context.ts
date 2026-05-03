import type { HandlerTypes } from '../enums/command-types.enum.js';

export class ExecutionContext {
    constructor(
        readonly name: string,
        readonly type: HandlerTypes,
        private readonly raw: unknown,
    ) {}

    getRaw<T>(): T {
        return this.raw as T;
    }
}
