import type { ExecutionContext } from '../../client/execution-context.js';
import type { Constructor } from '../common/constructor.js';

export interface NodecordInterceptor {
    intercept(ctx: ExecutionContext, next: () => Promise<unknown>): Promise<unknown>;
}

export interface RegisteredInterceptor {
    interceptor: NodecordInterceptor;
    type?: Constructor<any> | undefined;
}
