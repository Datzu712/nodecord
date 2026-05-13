/* eslint-disable @typescript-eslint/no-unsafe-return */
import { CommandParamTypes } from '../enums/command-types.enum.js';
import { RegisteredCommandHandler } from '../interfaces/handler/command-handler.js';
import type { RegisteredInterceptor } from '../interfaces/interceptor/interceptor.js';
import type { RegisteredExceptionHandler } from '../interfaces/exception-handler/exception-handler.js';
import type { AbstractLogger } from '../interfaces/common/abstract-logger.js';
import type { ExecutionContext } from '../context/execution-context.js';

export type ParamTypeResolver = (ctx: ExecutionContext, data?: unknown) => unknown;

export interface ExecuteParams {
    caller: () => any;
    interceptors?: RegisteredInterceptor[];
    exceptionHandlers?: RegisteredExceptionHandler[];
}

export class CommandExecutor {
    private readonly paramResolvers = new Map<CommandParamTypes, ParamTypeResolver>();

    constructor(private readonly logger: AbstractLogger) {}

    registerParamResolver(type: CommandParamTypes, resolver: ParamTypeResolver): void {
        this.paramResolvers.set(type, resolver);
    }

    resolveArgs(handler: RegisteredCommandHandler, ctx: ExecutionContext): unknown[] {
        return handler.executeOptions.params
            .sort((a, b) => a.index - b.index)
            .map((meta) => this.paramResolvers.get(meta.type)?.(ctx, meta.data));
    }

    async execute(
        ctx: ExecutionContext,
        { caller, interceptors = [], exceptionHandlers = [] }: ExecuteParams,
    ): Promise<unknown> {
        /**
         * Chain of responsibility pattern for interceptors. See https://gist.github.com/Datzu712/6ed9c6115e00fb6ffd48fd03bf4c77c8 for an example of this implementation.
         */
        const final = caller;

        const pipeline = interceptors.reduceRight(
            (next, { interceptor }) =>
                async () =>
                    interceptor.intercept(ctx, next),
            final,
        );

        try {
            return await pipeline();
        } catch (exception) {
            const matches = exceptionHandlers.filter(({ metadata }) =>
                metadata.exceptions.some((ExCls) => exception instanceof ExCls),
            );

            if (matches.length > 1) {
                this.logger.debug(
                    `Multiple exception handlers matched for command "${ctx.name}". ` +
                        `Executing the first one: ${matches[0]!.handler.constructor.name}. ` +
                        `Skipped: ${matches
                            .slice(1)
                            .map((m) => m.handler.constructor.name)
                            .join(', ')}.`,
                    'CommandExecutor',
                );
            }

            if (matches.length > 0) {
                return await matches[0]!.handler.handle(exception, ctx);
            }

            throw exception;
        }
    }
}
