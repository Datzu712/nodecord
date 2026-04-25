import type { HandlerTypes } from '../enums/command-types.enum.js';

export class ExecutionContext<TRaw = any> {
    constructor(
        readonly name: string,
        readonly type: HandlerTypes,
        private readonly raw: TRaw,
    ) {}

    getRaw() {
        return this.raw;
    }
}
