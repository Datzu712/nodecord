import { ExecutionContext, Interceptor } from '@nodecord/core';
import type { NodecordInterceptor } from '@nodecord/core';
import { EmbedBuilder } from 'discord.js';

@Interceptor()
export class StringToEmbedInterceptor implements NodecordInterceptor {
    async intercept(ctx: ExecutionContext, next: () => Promise<unknown>): Promise<unknown> {
        const result = await next();

        if (typeof result !== 'string') return result;

        return new EmbedBuilder().setDescription(result);
    }
}
