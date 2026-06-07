import { InteractionContext, Inject, Interceptor } from '@nodecord/core';
import type { NodecordInterceptor } from '@nodecord/core';
import { LoggerService } from '../modules/logger/logger.service.js';

@Interceptor()
export class CommandAuditInterceptor implements NodecordInterceptor {
    constructor(@Inject(LoggerService) private readonly logger: LoggerService) {}

    async intercept(ctx: InteractionContext, next: () => Promise<unknown>): Promise<unknown> {
        const author = ctx.getAuthor();

        this.logger.log(`Command "${ctx.name}" triggered by ${author.username}`);

        return next();
    }
}
