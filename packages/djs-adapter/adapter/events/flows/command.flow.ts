import type { Interaction as DjsInteraction } from 'discord.js';
import { type CommandExecutor, type ExecutionContext } from '@nodecord/core';
import type { DjsRegisteredCommand } from '../../command-registry.js';
import type { ResponseHandler } from '../../response-handler.js';

export class CommandInteractionFlow {
    constructor(
        private readonly executor: CommandExecutor,
        private readonly responseHandler: ResponseHandler,
    ) {}

    async handle(raw: DjsInteraction, ctx: ExecutionContext, cmd: DjsRegisteredCommand): Promise<void> {
        const isPassThrough = cmd.executeOptions.shouldPassThrough;

        const shouldDeferReply = cmd.executeOptions.shouldDefer;

        if (shouldDeferReply && raw.isChatInputCommand()) {
            await raw.deferReply();
        }

        const resolvedArgs = this.executor.resolveArgs(cmd, ctx);
        const handlerCaller = async () => (await cmd.handler.execute(...resolvedArgs)) as Promise<unknown>;

        const result = await this.executor.execute(ctx, {
            caller: handlerCaller,
            interceptors: cmd.interceptors,
            exceptionHandlers: cmd.exceptionHandlers,
        });

        if (!isPassThrough) {
            await this.responseHandler.resolve(result, ctx);
        }
    }
}
