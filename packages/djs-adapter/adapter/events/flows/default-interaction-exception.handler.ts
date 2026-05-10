import type { Interaction } from 'discord.js';
import type { AbstractLogger, ExceptionHandler, ExecutionContext, RegisteredExceptionHandler } from '@nodecord/core';

export class DefaultInteractionExceptionHandler implements ExceptionHandler {
    static readonly HANDLER_ID = 'nodecord-default-interaction-exception-handler';

    constructor(private readonly logger: AbstractLogger) {}

    async handle(exception: unknown, ctx: ExecutionContext): Promise<void> {
        try {
            const message = exception instanceof Error ? exception.message : String(exception);
            const stack = exception instanceof Error ? exception.stack : undefined;

            this.logger.error(
                `Unhandled exception during interaction "${ctx.name}": ${message}${stack ? `\n${stack}` : ''}`,
                'ExceptionHandler',
            );

            const raw = ctx.getRaw<Interaction>();
            if (raw.isAutocomplete()) {
                await raw.respond([]).catch(() => {});
                return;
            }

            if (raw.isChatInputCommand() || raw.isContextMenuCommand()) {
                const method = raw.deferred || raw.replied ? 'editReply' : 'reply';
                await raw[method]({ content: 'An unexpected error occurred.', ephemeral: true }).catch(() => {});

                return;
            }
        } catch {}
    }

    static asRegistered(logger: AbstractLogger): RegisteredExceptionHandler {
        return {
            handler: new DefaultInteractionExceptionHandler(logger),
            metadata: { id: DefaultInteractionExceptionHandler.HANDLER_ID, exceptions: [Error] },
        };
    }
}
