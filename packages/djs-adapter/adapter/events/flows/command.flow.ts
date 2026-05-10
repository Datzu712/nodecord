import type { Interaction as DjsInteraction } from 'discord.js';
import type { CommandExecutor, ExecutionContext } from '@nodecord/core';
import type { DjsRegisteredCommand } from '../../command-registry.js';
import type { ResponseHandler } from '../../response-handler.js';

export class CommandInteractionFlow {
    constructor(
        private readonly executor: CommandExecutor,
        private readonly responseHandler: ResponseHandler,
    ) {}

    async handle(raw: DjsInteraction, ctx: ExecutionContext, cmd: DjsRegisteredCommand): Promise<void> {
        const isPassThrough = this.executor.isPassThrough(cmd.handler);
        const shouldDeferReply = this.executor.isDeferReply(cmd.handler);

        if (shouldDeferReply && raw.isChatInputCommand()) {
            await raw.deferReply();
        }

        const caller = async () =>
            (await cmd.handler.execute(...this.executor.resolveArgs(cmd.handler, ctx))) as Promise<unknown>;

        const result = await this.executor.execute(ctx, {
            caller,
            interceptors: cmd.interceptors,
            exceptionHandlers: cmd.exceptionHandlers,
        });

        if (!isPassThrough) {
            await this.responseHandler.resolve(result, ctx);
        }
    }
}
