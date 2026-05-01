import { ExecutionContext, Inject, Interceptor } from '@nodecord/core';
import type { NodecordInterceptor } from '@nodecord/core';
import { LoggerService } from '../modules/logger/logger.service.js';

@Interceptor()
export class LatencyInterceptor implements NodecordInterceptor {
    constructor(@Inject(LoggerService) private readonly logger: LoggerService) {}

    async intercept(ctx: ExecutionContext, next: () => Promise<unknown>): Promise<unknown> {
        const start = Date.now();
        const result = await next();
        this.logger.log(`Command "${ctx.name}" responded in ${Date.now() - start}ms`);
        return result;
    }
}
