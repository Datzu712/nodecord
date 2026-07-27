import 'reflect-metadata';

import type { APIGuild, APIUser } from 'discord-api-types/v10';
import { randomUUID } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CommandPipelineBuilder } from '../client/command-pipeline-builder.js';
import { ExecutionKind } from '../constants/execution-kind.js';
import { InteractionContext } from '../context/interaction-context.js';
import { Interceptor } from '../decorators/interceptor.js';
import { OnException } from '../decorators/on-exception.js';
import type { ExceptionHandler } from '../interfaces/exception-handler/exception-handler.js';
import type {
    AbstractLogger,
    NodecordInterceptor,
    RegisteredExceptionHandler,
    RegisteredInterceptor,
} from '../interfaces/index.js';

const mockLogger: AbstractLogger = {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    verbose: vi.fn(),
};

class TestInteractionContext extends InteractionContext {
    constructor(name = 'test') {
        super(name, ExecutionKind.SLASH_COMMAND, {});
    }

    getGuild(): APIGuild {
        return {} as APIGuild;
    }

    getAuthor(): APIUser {
        return {} as APIUser;
    }
}

const makeCtx = (name = 'test') => new TestInteractionContext(name);

const makePipeline = (params: {
    caller: (...args: unknown[]) => Promise<unknown>;
    ctx?: InteractionContext;
    interceptors?: RegisteredInterceptor[];
    exceptionHandlers?: RegisteredExceptionHandler[];
}) =>
    new CommandPipelineBuilder(
        {
            caller: params.caller,
            ctx: params.ctx ?? makeCtx(),
            interceptors: params.interceptors ?? [],
            exceptionHandlers: params.exceptionHandlers ?? [],
            params: [],
        },
        mockLogger,
    );

describe('CommandPipelineBuilder', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('interceptors', () => {
        it('executes interceptors in the correct order', async () => {
            const executionOrder: string[] = [];

            @Interceptor()
            class InterceptorA implements NodecordInterceptor {
                async intercept(_ctx: InteractionContext, next: () => Promise<unknown>) {
                    executionOrder.push('1:before');
                    await next();
                    executionOrder.push('1:after');
                }
            }

            @Interceptor()
            class InterceptorB implements NodecordInterceptor {
                async intercept(_ctx: InteractionContext, next: () => Promise<unknown>) {
                    executionOrder.push('2:before');
                    await next();
                    executionOrder.push('2:after');
                }
            }

            const interceptors: RegisteredInterceptor[] = [
                { interceptor: new InterceptorA(), metadata: { id: randomUUID() } },
                { interceptor: new InterceptorB(), metadata: { id: randomUUID() } },
            ];

            await makePipeline({
                caller: async () => {
                    executionOrder.push('command');
                },
                interceptors,
            }).execute();

            expect(executionOrder).toEqual(['1:before', '2:before', 'command', '2:after', '1:after']);
        });

        it('propagates the return value of execute() through the interceptor pipeline', async () => {
            @Interceptor()
            class TransformInterceptor implements NodecordInterceptor {
                async intercept(_ctx: InteractionContext, next: () => Promise<unknown>) {
                    const result = await next();
                    return (result as string) + ':transformed';
                }
            }

            const result = await makePipeline({
                caller: async () => 'pong',
                interceptors: [{ interceptor: new TransformInterceptor(), metadata: { id: randomUUID() } }],
            }).execute();

            expect(result).toBe('pong:transformed');
        });

        it('short-circuits the pipeline when an interceptor does not call next()', async () => {
            const commandExecuted = { value: false };

            @Interceptor()
            class ShortCircuitInterceptor implements NodecordInterceptor {
                async intercept(_ctx: InteractionContext, _next: () => Promise<unknown>) {
                    return 'short-circuit';
                }
            }

            const result = await makePipeline({
                caller: async () => {
                    commandExecuted.value = true;
                    return 'pong';
                },
                interceptors: [{ interceptor: new ShortCircuitInterceptor(), metadata: { id: randomUUID() } }],
            }).execute();

            expect(result).toBe('short-circuit');
            expect(commandExecuted.value).toBe(false);
        });
    });

    describe('exception handlers', () => {
        describe('basic execution', () => {
            it('calls the exception handler when the command throws a matching exception', async () => {
                class AppError extends Error {}

                @OnException(AppError)
                class AppErrorHandler implements ExceptionHandler {
                    handle = vi.fn();
                }

                const handler = new AppErrorHandler();
                const ctx = makeCtx();

                await makePipeline({
                    caller: () => {
                        throw new AppError('boom');
                    },
                    ctx,
                    exceptionHandlers: [{ handler, metadata: { id: randomUUID(), exceptions: [AppError] } }],
                }).execute();

                expect(handler.handle).toHaveBeenCalledWith(expect.any(AppError), ctx);
            });

            it('rethrows the exception when no exception handler matches', async () => {
                class AppError extends Error {}
                class OtherError extends Error {}

                @OnException(OtherError)
                class OtherHandler implements ExceptionHandler {
                    handle = vi.fn();
                }

                const handler = new OtherHandler();

                await expect(
                    makePipeline({
                        caller: () => {
                            throw new AppError('unhandled');
                        },
                        exceptionHandlers: [{ handler, metadata: { id: randomUUID(), exceptions: [OtherError] } }],
                    }).execute(),
                ).rejects.toThrow(AppError);

                expect(handler.handle).not.toHaveBeenCalled();
            });

            it('passes the InteractionContext to the exception handler', async () => {
                class AppError extends Error {}

                @OnException(AppError)
                class AppErrorHandler implements ExceptionHandler {
                    handle = vi.fn();
                }

                const handler = new AppErrorHandler();
                const ctx = makeCtx('ping');

                await makePipeline({
                    caller: () => {
                        throw new AppError();
                    },
                    ctx,
                    exceptionHandlers: [{ handler, metadata: { id: randomUUID(), exceptions: [AppError] } }],
                }).execute();

                expect(handler.handle).toHaveBeenCalledWith(expect.any(AppError), ctx);
            });

            it('propagates an exception thrown inside the exception handler', async () => {
                class AppError extends Error {}
                class HandlerError extends Error {}

                @OnException(AppError)
                class BrokenHandler implements ExceptionHandler {
                    handle() {
                        throw new HandlerError('handler failed');
                    }
                }

                await expect(
                    makePipeline({
                        caller: () => {
                            throw new AppError();
                        },
                        exceptionHandlers: [
                            { handler: new BrokenHandler(), metadata: { id: randomUUID(), exceptions: [AppError] } },
                        ],
                    }).execute(),
                ).rejects.toThrow(HandlerError);
            });
        });

        describe('multiple handlers', () => {
            it('executes only the first matching exception handler', async () => {
                class AppError extends Error {}

                @OnException(AppError)
                class FirstHandler implements ExceptionHandler {
                    handle = vi.fn();
                }

                @OnException(AppError)
                class SecondHandler implements ExceptionHandler {
                    handle = vi.fn();
                }

                const first = new FirstHandler();
                const second = new SecondHandler();

                await makePipeline({
                    caller: () => {
                        throw new AppError();
                    },
                    exceptionHandlers: [
                        { handler: first, metadata: { id: randomUUID(), exceptions: [AppError] } },
                        { handler: second, metadata: { id: randomUUID(), exceptions: [AppError] } },
                    ],
                }).execute();

                expect(first.handle).toHaveBeenCalledOnce();
                expect(second.handle).not.toHaveBeenCalled();
            });

            it('logs a debug message when more than one handler matches', async () => {
                class AppError extends Error {}

                @OnException(AppError)
                class HandlerA implements ExceptionHandler {
                    handle = vi.fn();
                }

                @OnException(AppError)
                class HandlerB implements ExceptionHandler {
                    handle = vi.fn();
                }

                await makePipeline({
                    caller: () => {
                        throw new AppError();
                    },
                    exceptionHandlers: [
                        { handler: new HandlerA(), metadata: { id: randomUUID(), exceptions: [AppError] } },
                        { handler: new HandlerB(), metadata: { id: randomUUID(), exceptions: [AppError] } },
                    ],
                }).execute();

                expect(mockLogger.debug).toHaveBeenCalledWith(
                    expect.stringContaining('Multiple exception handlers matched'),
                    'CommandExecutor',
                );
            });
        });

        describe('interaction with interceptors', () => {
            it('catches an exception thrown inside an interceptor (before next)', async () => {
                class InterceptorError extends Error {}

                @Interceptor()
                class ThrowingInterceptor implements NodecordInterceptor {
                    async intercept(_ctx: InteractionContext, _next: () => Promise<unknown>) {
                        throw new InterceptorError('interceptor failed');
                    }
                }

                @OnException(InterceptorError)
                class InterceptorErrorHandler implements ExceptionHandler {
                    handle = vi.fn();
                }

                const commandExecute = vi.fn();
                const handler = new InterceptorErrorHandler();

                await makePipeline({
                    caller: commandExecute,
                    interceptors: [{ interceptor: new ThrowingInterceptor(), metadata: { id: randomUUID() } }],
                    exceptionHandlers: [{ handler, metadata: { id: randomUUID(), exceptions: [InterceptorError] } }],
                }).execute();

                expect(handler.handle).toHaveBeenCalledWith(
                    expect.any(InterceptorError),
                    expect.any(InteractionContext),
                );
                expect(commandExecute).not.toHaveBeenCalled();
            });

            it('catches an exception thrown inside an interceptor (after next)', async () => {
                class PostError extends Error {}

                @Interceptor()
                class PostThrowInterceptor implements NodecordInterceptor {
                    async intercept(_ctx: InteractionContext, next: () => Promise<unknown>) {
                        await next();
                        throw new PostError('post-next exception');
                    }
                }

                @OnException(PostError)
                class PostErrorHandler implements ExceptionHandler {
                    handle = vi.fn();
                }

                const handler = new PostErrorHandler();

                await makePipeline({
                    caller: async () => {},
                    interceptors: [{ interceptor: new PostThrowInterceptor(), metadata: { id: randomUUID() } }],
                    exceptionHandlers: [{ handler, metadata: { id: randomUUID(), exceptions: [PostError] } }],
                }).execute();

                expect(handler.handle).toHaveBeenCalledWith(expect.any(PostError), expect.any(InteractionContext));
            });

            it('does not call the exception handler when the interceptor short-circuits without throwing', async () => {
                @Interceptor()
                class ShortCircuitInterceptor implements NodecordInterceptor {
                    async intercept(_ctx: InteractionContext, _next: () => Promise<unknown>) {
                        return 'short-circuit';
                    }
                }

                @OnException(Error)
                class ErrorHandler implements ExceptionHandler {
                    handle = vi.fn();
                }

                const handler = new ErrorHandler();
                const result = await makePipeline({
                    caller: async () => 'pong',
                    interceptors: [{ interceptor: new ShortCircuitInterceptor(), metadata: { id: randomUUID() } }],
                    exceptionHandlers: [{ handler, metadata: { id: randomUUID(), exceptions: [Error] } }],
                }).execute();

                expect(result).toBe('short-circuit');
                expect(handler.handle).not.toHaveBeenCalled();
            });
        });
    });

    describe('pipeline order', () => {
        it('executes interceptor befores but NOT afters when the command throws, then runs the exception handler', async () => {
            const order: string[] = [];
            class AppError extends Error {}

            @Interceptor()
            class InterceptorA implements NodecordInterceptor {
                async intercept(_ctx: InteractionContext, next: () => Promise<unknown>) {
                    order.push('A:before');
                    await next();
                    order.push('A:after'); // should NOT be reached
                }
            }

            @Interceptor()
            class InterceptorB implements NodecordInterceptor {
                async intercept(_ctx: InteractionContext, next: () => Promise<unknown>) {
                    order.push('B:before');
                    await next();
                    order.push('B:after'); // should NOT be reached
                }
            }

            @OnException(AppError)
            class AppErrorHandler implements ExceptionHandler {
                handle() {
                    order.push('exception:handler');
                }
            }

            await makePipeline({
                caller: () => {
                    order.push('command');
                    throw new AppError();
                },
                interceptors: [
                    { interceptor: new InterceptorA(), metadata: { id: randomUUID() } },
                    { interceptor: new InterceptorB(), metadata: { id: randomUUID() } },
                ],
                exceptionHandlers: [
                    { handler: new AppErrorHandler(), metadata: { id: randomUUID(), exceptions: [AppError] } },
                ],
            }).execute();

            expect(order).toEqual(['A:before', 'B:before', 'command', 'exception:handler']);
        });

        it('executes the handler-level exception handler first regardless of how many module-level handlers match', async () => {
            const order: string[] = [];
            class AppError extends Error {}

            @OnException(AppError)
            class ModuleLevelA implements ExceptionHandler {
                handle() {
                    order.push('module-a');
                }
            }

            @OnException(AppError)
            class ModuleLevelB implements ExceptionHandler {
                handle() {
                    order.push('module-b');
                }
            }

            @OnException(AppError)
            class HandlerLevel implements ExceptionHandler {
                handle() {
                    order.push('handler-level');
                }
            }

            // handler-level is prepended before module-level (mirrors compilePendingHandlers behavior)
            await makePipeline({
                caller: () => {
                    throw new AppError();
                },
                exceptionHandlers: [
                    { handler: new HandlerLevel(), metadata: { id: randomUUID(), exceptions: [AppError] } },
                    { handler: new ModuleLevelA(), metadata: { id: randomUUID(), exceptions: [AppError] } },
                    { handler: new ModuleLevelB(), metadata: { id: randomUUID(), exceptions: [AppError] } },
                ],
            }).execute();

            // only the first match runs — module-level handlers are never reached
            expect(order).toEqual(['handler-level']);
        });
    });
});
