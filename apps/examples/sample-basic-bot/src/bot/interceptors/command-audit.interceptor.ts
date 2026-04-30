import { ExecutionContext, Inject, Interceptor } from '@nodecord/core';
import type { NodecordInterceptor } from '@nodecord/core';
import { type ChatInputCommandInteraction } from 'discord.js';
import { LoggerService } from '../modules/logger/logger.service.js';

@Interceptor()
export class CommandAuditInterceptor implements NodecordInterceptor {
    constructor(@Inject(LoggerService) private readonly logger: LoggerService) {}

    async intercept(
        ctx: ExecutionContext<ChatInputCommandInteraction>,
        next: () => Promise<unknown>,
    ): Promise<unknown> {
        const interaction = ctx.getRaw();
        this.logger.log(`Command "${ctx.name}" triggered by ${interaction.user.username}`);
        return next();
    }
}
