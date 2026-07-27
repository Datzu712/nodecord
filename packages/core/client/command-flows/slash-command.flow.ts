import { ChatInputCommandContext } from '../../context/chat-input-command-context.js';
import { BaseCommandFlow } from '../../interfaces/handler/base-command-flow.js';
import { SlashCommandExecuteOptions } from '../../interfaces/handler/executions/slash-command.js';
import { AbstractLogger, RegisteredCommandHandler } from '../../interfaces/index.js';
import type { InteractionReplyOptions } from '../../interfaces/interactions/repliable.js';
import { CommandPipelineBuilder } from '../command-pipeline-builder.js';

export class ChatInputCommandFlow implements BaseCommandFlow {
    constructor(private readonly logger: AbstractLogger) {}

    async execute(ctx: ChatInputCommandContext, cmd: RegisteredCommandHandler): Promise<void> {
        const executeOptions = cmd.executors.find(
            ([methodKey, options]) => options.kind === 'slashCommand' && methodKey === 'execute',
        ) as ['execute', SlashCommandExecuteOptions] | undefined;

        if (!executeOptions || typeof cmd.handler.execute !== 'function') {
            this.logger.warn(
                `No valid executor found for chat input command "${cmd.metadata.name}". Make sure that your command handler class has an "execute" method decorated with @SlashCommand() and that it is properly registered.`,
                'CommandExecutor',
            );
            return;
        }
        const [, executorOptions] = executeOptions;

        const shouldDefer = executorOptions.defer;
        const shouldHandleResponse = !executorOptions.passThrough;

        if (shouldDefer) {
            await ctx.deferReply();
        }

        const pipeline = new CommandPipelineBuilder({
            caller: async (...args: unknown[]) => cmd.handler.execute(...args) as Promise<unknown>,
            ctx,
            interceptors: cmd.interceptors,
            exceptionHandlers: cmd.exceptionHandlers,
            params: executorOptions.params,
        });

        const result = await pipeline.execute();

        if (!shouldHandleResponse || result == null) return;
        const replyOptions: InteractionReplyOptions = typeof result === 'string' ? { content: result } : result;

        if (shouldDefer) {
            await ctx.editReply(replyOptions);
        } else {
            await ctx.reply(replyOptions);
        }
    }
}
