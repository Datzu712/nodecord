import type { InteractionContext } from '../../context/interaction-context.js';

export interface NodecordInterceptor<N = any, R = any> {
    intercept(ctx: InteractionContext, next: () => Promise<N>): Promise<R>;
}

export interface RegisteredInterceptor {
    interceptor: NodecordInterceptor;
    metadata: {
        type?: any; // Currently I'm thinking how to specify when the interceptor should be applied because handlers can be executed with different interaction types (Context menu, buttons, selects, chat interactions, etc)
        id: string;
    };
}
