import type { ExecutionContext } from '../../client/execution-context.js';
import type { Constructor } from '../common/constructor.js';

export interface NodecordInterceptor<N = any, R = any> {
    intercept(ctx: ExecutionContext, next: () => Promise<N>): Promise<R>;
}

export interface RegisteredInterceptor {
    interceptor: NodecordInterceptor;
    type?: Constructor<any> | undefined;
}
