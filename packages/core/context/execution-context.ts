import type { CommandInteraction, InteractionReplyOptions } from '../interfaces/intereactions/command-interaction.js';

export abstract class ExecutionContext implements CommandInteraction {
    constructor(
        readonly name: string,
        // readonly type: HandlerTypes,
        private readonly raw: unknown,
    ) {}

    getRaw<T>(): T {
        return this.raw as T;
    }

    abstract reply(options: InteractionReplyOptions): Promise<void>;
}
