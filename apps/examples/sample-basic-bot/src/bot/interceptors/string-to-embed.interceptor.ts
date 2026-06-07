import { Interceptor, InteractionContext, InteractionReplyOptions } from '@nodecord/core';
import type { NodecordInterceptor } from '@nodecord/core';

@Interceptor()
export class StringToEmbedInterceptor implements NodecordInterceptor {
    async intercept(_ctx: InteractionContext, next: () => Promise<unknown>): Promise<unknown> {
        const result = await next();

        if (typeof result !== 'string') return result;

        return { embeds: [{ description: result }] } satisfies InteractionReplyOptions;
    }
}
