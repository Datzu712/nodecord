import 'reflect-metadata';

import { describe, expect, it } from 'vitest';

import { Interceptor } from '../decorators/interceptor.js';
import { CommandHandler, NodecordInterceptor } from '../interfaces/index.js';
import { ExecutionContext } from '../client/execution-context.js';
import { SlashCommand } from '../decorators/slash-command.js';
import { HandlerTypes } from '../enums/command-types.enum.js';
import { CommandExecutor } from '../client/command-executor.js';
import { randomUUID } from 'node:crypto';

describe('CommandExecutor', () => {
    it('should execute interceptors in the correct order', async () => {
        const executionOrder: string[] = [];

        @Interceptor()
        class GlobalTestInterceptorA implements NodecordInterceptor {
            async intercept(_ctx: ExecutionContext, next: () => Promise<unknown>) {
                executionOrder.push('1:before');
                await next();
                executionOrder.push('1:after');
            }
        }

        @Interceptor()
        class TestInterceptorB implements NodecordInterceptor {
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
            { interceptor: new GlobalTestInterceptorA(), metadata: { id: randomUUID() } },
            { interceptor: new TestInterceptorB(), metadata: { id: randomUUID() } },
        ];
        const command = new TestCommand();

        const ctx = new ExecutionContext('test', HandlerTypes.SLASH, {});

        const commandExecutor = new CommandExecutor();
        await commandExecutor.execute(ctx, command, interceptors);

        const expectedOrder = ['1:before', '2:before', 'command', '2:after', '1:after'];
        expect(executionOrder).toEqual(expectedOrder);
    });

    it('should propagate the return value of execute() through the interceptor pipeline', async () => {
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

        const ctx = new ExecutionContext('test', HandlerTypes.SLASH, {});
        const commandExecutor = new CommandExecutor();

        const result = await commandExecutor.execute(ctx, new TestCommand(), [
            { interceptor: new TransformInterceptor(), metadata: { id: randomUUID() } },
        ]);
        expect(result).toBe('pong:transformed');
    });

    it('should short-circuit the pipeline when an interceptor does not call next()', async () => {
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

        const ctx = new ExecutionContext('test', HandlerTypes.SLASH, {});
        const commandExecutor = new CommandExecutor();

        const result = await commandExecutor.execute(ctx, new TestCommand(), [
            { interceptor: new ShortCircuitInterceptor(), metadata: { id: randomUUID() } },
        ]);

        expect(result).toBe('short-circuit');
        expect(commandExecuted.value).toBe(false);
    });
});
