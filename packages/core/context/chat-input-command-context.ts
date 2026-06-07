import { ExecutionKind } from '../constants/execution-kind.js';
import type { DeferReplyOptions, InteractionReplyOptions } from '../interfaces/interactions/repliable.js';
import { InteractionContext } from './interaction-context.js';

export abstract class ChatInputCommandContext extends InteractionContext {
    constructor(name: string, raw: unknown) {
        super(name, ExecutionKind.SLASH_COMMAND, raw);
    }

    //abstract readonly deferred: boolean;
    //abstract readonly replied: boolean;

    abstract reply(options: InteractionReplyOptions): Promise<void>;
    abstract deferReply(options?: DeferReplyOptions): Promise<void>;
    abstract editReply(options: InteractionReplyOptions): Promise<void>;
    abstract followUp(options: InteractionReplyOptions): Promise<void>;
    abstract getOptions(): { name: string; value: string | number | boolean }[];
}
