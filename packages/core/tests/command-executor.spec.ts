import 'reflect-metadata';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Interceptor } from '../decorators/interceptor.js';
import { OnException } from '../decorators/on-exception.js';
import { CommandHandler, NodecordInterceptor } from '../interfaces/index.js';
import type { ExceptionHandler } from '../interfaces/exception-handler/exception-handler.js';
import { ExecutionContext } from '../context/execution-context.js';
import { SlashCommand } from '../decorators/slash-command.js';
import { HandlerTypes } from '../enums/command-types.enum.js';
import { CommandExecutor } from '../client/command-executor.js';
import type { AbstractLogger } from '../interfaces/common/abstract-logger.js';
import { randomUUID } from 'node:crypto';

const mockLogger: AbstractLogger = {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    verbose: vi.fn(),
};

const makeExecutor = () => new CommandExecutor(mockLogger);
const makeCtx = (name = 'test') => new ExecutionContext(name, HandlerTypes.SLASH, {});

describe('CommandExecutor', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('interceptors', () => {
        it('executes interceptors in the correct order', async () => {
            const executionOrder: string[] = [];

            @Interceptor()
            class InterceptorA implements NodecordInterceptor {
                async intercept(_ctx: ExecutionContext, next: () => Promise<unknown>) {
                    executionOrder.push('1:before');
                    await next();
                    executionOrder.push('1:after');
                }
            }

            @Interceptor()
            class InterceptorB implements NodecordInterceptor {
                async intercept(_ctx: ExecutionContext, next: () => Promise<unknown>) {
                    executionOrder.push('2:before');
                    await next();
                    executionOrder.push('2:after');
                }
            }

            @SlashCommand('test')
            class TestCommand implements CommandHandler {
                async execute() {
                    executionOrder.push('command');
                }
            }

            const interceptors = [
                { interceptor: new InterceptorA(), metadata: { id: randomUUID() } },
                { interceptor: new InterceptorB(), metadata: { id: randomUUID() } },
            ];

            await makeExecutor().execute(makeCtx(), { caller: () => new TestCommand().execute(), interceptors });

            expect(executionOrder).toEqual(['1:before', '2:before', 'command', '2:after', '1:after']);
        });

        it('propagates the return value of execute() through the interceptor pipeline', async () => {
            @Interceptor()
            class TransformInterceptor implements NodecordInterceptor {
                async intercept(_ctx: ExecutionContext, next: () => Promise<unknown>) {
                    const result = await next();
                    return result + ':transformed';
                }
            }

            @SlashCommand('test')
            class TestCommand implements CommandHandler {
                async execute() {
                    return 'pong';
                }
            }

            const command = new TestCommand();
            const result = await makeExecutor().execute(makeCtx(), {
                caller: () => command.execute(),
                interceptors: [{ interceptor: new TransformInterceptor(), metadata: { id: randomUUID() } }],
            });

            expect(result).toBe('pong:transformed');
        });

        it('short-circuits the pipeline when an interceptor does not call next()', async () => {
            const commandExecuted = { value: false };

            @Interceptor()
            class ShortCircuitInterceptor implements NodecordInterceptor {
                async intercept(_ctx: ExecutionContext, _next: () => Promise<unknown>) {
                    return 'short-circuit';
                }
            }

            @SlashCommand('test')
            class TestCommand implements CommandHandler {
                async execute() {
                    commandExecuted.value = true;
                    return 'pong';
                }
            }

            const command = new TestCommand();
            const result = await makeExecutor().execute(makeCtx(), {
                caller: () => command.execute(),
                interceptors: [{ interceptor: new ShortCircuitInterceptor(), metadata: { id: randomUUID() } }],
            });

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

                @SlashCommand('test')
                class TestCommand implements CommandHandler {
                    execute() {
                        throw new AppError('boom');
                    }
                }

                const handler = new AppErrorHandler();
                const ctx = makeCtx();

                await makeExecutor().execute(ctx, {
                    caller: () => new TestCommand().execute(),
                    exceptionHandlers: [{ handler, metadata: { id: randomUUID(), exceptions: [AppError] } }],
                });

                expect(handler.handle).toHaveBeenCalledWith(expect.any(AppError), ctx);
            });

            it('rethrows the exception when no exception handler matches', async () => {
                class AppError extends Error {}
                class OtherError extends Error {}

                @OnException(OtherError)
                class OtherHandler implements ExceptionHandler {
                    handle = vi.fn();
                }

                @SlashCommand('test')
                class TestCommand implements CommandHandler {
                    execute() {
                        throw new AppError('unhandled');
                    }
                }

                const handler = new OtherHandler();

                await expect(
                    makeExecutor().execute(makeCtx(), {
                        caller: () => new TestCommand().execute(),
                        exceptionHandlers: [{ handler, metadata: { id: randomUUID(), exceptions: [OtherError] } }],
                    }),
                ).rejects.toThrow(AppError);

                expect(handler.handle).not.toHaveBeenCalled();
            });

            it('passes the ExecutionContext to the exception handler', async () => {
                class AppError extends Error {}

                @OnException(AppError)
                class AppErrorHandler implements ExceptionHandler {
                    handle = vi.fn();
                }

                @SlashCommand('ping')
                class TestCommand implements CommandHandler {
                    execute() {
                        throw new AppError();
                    }
                }

                const handler = new AppErrorHandler();
                const ctx = makeCtx('ping');

                await makeExecutor().execute(ctx, {
                    caller: () => new TestCommand().execute(),
                    exceptionHandlers: [{ handler, metadata: { id: randomUUID(), exceptions: [AppError] } }],
                });

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

                @SlashCommand('test')
                class TestCommand implements CommandHandler {
                    execute() {
                        throw new AppError();
                    }
                }

                await expect(
                    makeExecutor().execute(makeCtx(), {
                        caller: () => new TestCommand().execute(),
                        exceptionHandlers: [
                            { handler: new BrokenHandler(), metadata: { id: randomUUID(), exceptions: [AppError] } },
                        ],
                    }),
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

                @SlashCommand('test')
                class TestCommand implements CommandHandler {
                    execute() {
                        throw new AppError();
                    }
                }

                const first = new FirstHandler();
                const second = new SecondHandler();

                await makeExecutor().execute(makeCtx(), {
                    caller: () => new TestCommand().execute(),
                    exceptionHandlers: [
                        { handler: first, metadata: { id: randomUUID(), exceptions: [AppError] } },
                        { handler: second, metadata: { id: randomUUID(), exceptions: [AppError] } },
                    ],
                });

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

                @SlashCommand('test')
                class TestCommand implements CommandHandler {
                    execute() {
                        throw new AppError();
                    }
                }

                await makeExecutor().execute(makeCtx(), {
                    caller: () => new TestCommand().execute(),
                    exceptionHandlers: [
                        { handler: new HandlerA(), metadata: { id: randomUUID(), exceptions: [AppError] } },
                        { handler: new HandlerB(), metadata: { id: randomUUID(), exceptions: [AppError] } },
                    ],
                });

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
                    async intercept(_ctx: ExecutionContext, _next: () => Promise<unknown>) {
                        throw new InterceptorError('interceptor failed');
                    }
                }

                @OnException(InterceptorError)
                class InterceptorErrorHandler implements ExceptionHandler {
                    handle = vi.fn();
                }

                @SlashCommand('test')
                class TestCommand implements CommandHandler {
                    execute = vi.fn();
                }

                const handler = new InterceptorErrorHandler();
                const command = new TestCommand();

                await makeExecutor().execute(makeCtx(), {
                    caller: () => command.execute(),
                    interceptors: [{ interceptor: new ThrowingInterceptor(), metadata: { id: randomUUID() } }],
                    exceptionHandlers: [{ handler, metadata: { id: randomUUID(), exceptions: [InterceptorError] } }],
                });

                expect(handler.handle).toHaveBeenCalledWith(expect.any(InterceptorError), expect.any(ExecutionContext));
                expect(command.execute).not.toHaveBeenCalled();
            });

            it('catches an exception thrown inside an interceptor (after next)', async () => {
                class PostError extends Error {}

                @Interceptor()
                class PostThrowInterceptor implements NodecordInterceptor {
                    async intercept(_ctx: ExecutionContext, next: () => Promise<unknown>) {
                        await next();
                        throw new PostError('post-next exception');
                    }
                }

                @OnException(PostError)
                class PostErrorHandler implements ExceptionHandler {
                    handle = vi.fn();
                }

                @SlashCommand('test')
                class TestCommand implements CommandHandler {
                    execute = vi.fn();
                }

                const handler = new PostErrorHandler();

                await makeExecutor().execute(makeCtx(), {
                    caller: () => new TestCommand().execute(),
                    interceptors: [{ interceptor: new PostThrowInterceptor(), metadata: { id: randomUUID() } }],
                    exceptionHandlers: [{ handler, metadata: { id: randomUUID(), exceptions: [PostError] } }],
                });

                expect(handler.handle).toHaveBeenCalledWith(expect.any(PostError), expect.any(ExecutionContext));
            });

            it('does not call the exception handler when the interceptor short-circuits without throwing', async () => {
                @Interceptor()
                class ShortCircuitInterceptor implements NodecordInterceptor {
                    async intercept(_ctx: ExecutionContext, _next: () => Promise<unknown>) {
                        return 'short-circuit';
                    }
                }

                @OnException(Error)
                class ErrorHandler implements ExceptionHandler {
                    handle = vi.fn();
                }

                @SlashCommand('test')
                class TestCommand implements CommandHandler {
                    execute = vi.fn();
                }

                const handler = new ErrorHandler();
                const result = await makeExecutor().execute(makeCtx(), {
                    caller: () => new TestCommand().execute(),
                    interceptors: [{ interceptor: new ShortCircuitInterceptor(), metadata: { id: randomUUID() } }],
                    exceptionHandlers: [{ handler, metadata: { id: randomUUID(), exceptions: [Error] } }],
                });

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
                async intercept(_ctx: ExecutionContext, next: () => Promise<unknown>) {
                    order.push('A:before');
                    await next();
                    order.push('A:after'); // should NOT be reached
                }
            }

            @Interceptor()
            class InterceptorB implements NodecordInterceptor {
                async intercept(_ctx: ExecutionContext, next: () => Promise<unknown>) {
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

            @SlashCommand('test')
            class TestCommand implements CommandHandler {
                execute() {
                    order.push('command');
                    throw new AppError();
                }
            }

            await makeExecutor().execute(makeCtx(), {
                caller: () => new TestCommand().execute(),
                interceptors: [
                    { interceptor: new InterceptorA(), metadata: { id: randomUUID() } },
                    { interceptor: new InterceptorB(), metadata: { id: randomUUID() } },
                ],
                exceptionHandlers: [
                    { handler: new AppErrorHandler(), metadata: { id: randomUUID(), exceptions: [AppError] } },
                ],
            });

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

            @SlashCommand('test')
            class TestCommand implements CommandHandler {
                execute() {
                    throw new AppError();
                }
            }

            // handler-level is prepended before module-level (mirrors compilePendingHandlers behavior)
            await makeExecutor().execute(makeCtx(), {
                caller: () => new TestCommand().execute(),
                exceptionHandlers: [
                    { handler: new HandlerLevel(), metadata: { id: randomUUID(), exceptions: [AppError] } },
                    { handler: new ModuleLevelA(), metadata: { id: randomUUID(), exceptions: [AppError] } },
                    { handler: new ModuleLevelB(), metadata: { id: randomUUID(), exceptions: [AppError] } },
                ],
            });

            // only the first match runs — module-level handlers are never reached
            expect(order).toEqual(['handler-level']);
        });
    });
});
