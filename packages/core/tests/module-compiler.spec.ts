import 'reflect-metadata';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ModuleCompiler } from '../client/container/module-compiler.js';
import { Inject } from '../decorators/inject.js';
import { Injectable } from '../decorators/injectable.js';
import { Module } from '../decorators/module.js';
import { Interceptor } from '../decorators/interceptor.js';
import { Listener } from '../decorators/listener.js';
import { SlashCommand } from '../decorators/slash-command.js';
import { UseInterceptors } from '../decorators/use-interceptors.js';
import type { AbstractLogger } from '../interfaces/common/abstract-logger.js';
import type { ListenerProvider } from '../interfaces/listener/event-listener.js';

const mockLogger: AbstractLogger = {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    verbose: vi.fn(),
};

describe('ModuleCompiler', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('module validation', () => {
        it('throws when moduleClass is undefined', () => {
            const compiler = new ModuleCompiler(mockLogger);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect(() => compiler.compile(undefined as any)).toThrow('An import resolved to undefined');
        });

        it('throws when class is not decorated with @Module', () => {
            class NotAModule {}

            const compiler = new ModuleCompiler(mockLogger);
            expect(() => compiler.compile(NotAModule)).toThrow('is not a valid module');
        });
    });

    describe('providers', () => {
        describe('registration', () => {
            it('throws when a provider in providers[] is not decorated with @Injectable', () => {
                class PlainService {}

                @Module({ providers: [PlainService] })
                class AppModule {}

                const compiler = new ModuleCompiler(mockLogger);
                expect(() => compiler.compile(AppModule)).toThrow('is not a valid provider');
            });

            it('getContainerFor() throws when class is not decorated with @Injectable', () => {
                class PlainService {}

                const compiler = new ModuleCompiler(mockLogger);
                expect(() => compiler.getContainerFor(PlainService)).toThrow('is not a valid provider');
            });

            it('getContainerFor() throws when @Injectable is not registered in any module', () => {
                @Injectable()
                class MyService {}

                const compiler = new ModuleCompiler(mockLogger);
                expect(() => compiler.getContainerFor(MyService)).toThrow('not registered in any module');
            });

            it('registers a valid @Injectable provider', () => {
                @Injectable()
                class MyService {}

                @Module({ providers: [MyService] })
                class AppModule {}

                const compiler = new ModuleCompiler(mockLogger);
                compiler.compile(AppModule);
                expect(compiler.getContainerFor(MyService)).toBeDefined();
            });
        });

        describe('execution', () => {
            it('resolves a provider instance from its container', () => {
                @Injectable()
                class MyService {
                    getValue() {
                        return 'hello';
                    }
                }

                @Module({ providers: [MyService] })
                class AppModule {}

                const compiler = new ModuleCompiler(mockLogger);
                compiler.compile(AppModule);

                const serviceInstance = compiler.getContainerFor(MyService).resolve(MyService);
                expect(serviceInstance).toBeInstanceOf(MyService);
                expect(serviceInstance.getValue()).toBe('hello');
            });

            it('throws at resolution time when a dependency is not registered in any module', () => {
                @Injectable()
                class UnregisteredDep {}

                @Injectable()
                class MyService {
                    constructor(@Inject(UnregisteredDep) private dep: UnregisteredDep) {}
                }
                @Module({ providers: [MyService] })
                class AppModule {}

                const compiler = new ModuleCompiler(mockLogger);
                compiler.compile(AppModule);

                /**
                 * Inversify resolves dependencies lazily, so the error is only thrown when
                 * we try to resolve the provider from the container, not during compile().
                 */
                expect(() => compiler.getContainerFor(MyService).resolve(MyService)).toThrow();
            });
        });
    });

    describe('handlers', () => {
        describe('registration', () => {
            it('throws when a handler in handlers[] is not decorated with a command decorator', () => {
                class PlainHandler {}

                @Module({ handlers: [PlainHandler] })
                class AppModule {}

                const compiler = new ModuleCompiler(mockLogger);
                expect(() => compiler.compile(AppModule)).toThrow('is not a valid command handler');
            });

            it('registers a valid handler and exposes it via getHandlers()', () => {
                @SlashCommand({ name: 'ping', description: 'Pong' })
                class PingHandler {}

                @Module({ handlers: [PingHandler] })
                class AppModule {}

                const compiler = new ModuleCompiler(mockLogger);
                compiler.compile(AppModule);

                const handlers = compiler.getHandlers();
                expect(handlers).toHaveLength(1);
                expect(handlers[0]?.handler).toBeInstanceOf(PingHandler);
            });
        });

        describe('execution', () => {
            it('resolved handler instance can execute its method', () => {
                @SlashCommand({ name: 'ping', description: 'Pong' })
                class PingHandler {
                    execute() {
                        return 'pong';
                    }
                }
                @Module({ handlers: [PingHandler] })
                class AppModule {}

                const compiler = new ModuleCompiler(mockLogger);
                compiler.compile(AppModule);

                const [handler] = compiler.getHandlers();
                expect((handler?.handler as PingHandler).execute()).toBe('pong');
            });
        });
    });

    describe('listeners', () => {
        describe('registration', () => {
            it('throws when a listener in providers[] is not decorated with @Listener or @Injectable', () => {
                class PlainListener {}

                @Module({ providers: [PlainListener] })
                class AppModule {}

                const compiler = new ModuleCompiler(mockLogger);
                expect(() => compiler.compile(AppModule)).toThrow('is not a valid provider');
            });

            it('registers a valid @Listener and exposes it via getEventListeners()', () => {
                @Listener('ready')
                class ReadyListener implements ListenerProvider {
                    handler() {}
                }

                @Module({ providers: [ReadyListener] })
                class AppModule {}

                const compiler = new ModuleCompiler(mockLogger);
                compiler.compile(AppModule);

                const listeners = compiler.getEventListeners();
                expect(listeners).toHaveLength(1);
                expect(listeners[0]?.listener).toBeInstanceOf(ReadyListener);
            });
        });

        describe('execution', () => {
            it('resolved listener instance has its dependencies correctly injected', () => {
                /**
                 * The core only resolves the listener instance via DI. Invoking handler() is the
                 * adapter's responsibility. This test simply verifies that the listener's
                 * dependencies are injected correctly when the instance is resolved.
                 *
                 * So be aware that this is not a real example of an event listener in our framework :)
                 */
                @Injectable()
                class SomeDependency {
                    getData(content: string) {
                        return `data: ${content}`;
                    }
                }

                @Listener('message')
                class MessageListener implements ListenerProvider<string[]> {
                    constructor(private dep: SomeDependency) {}

                    handler(content: string) {
                        return this.dep.getData(content);
                    }
                }

                @Module({ providers: [SomeDependency, MessageListener] })
                class AppModule {}

                const compiler = new ModuleCompiler(mockLogger);
                compiler.compile(AppModule);

                const [listener] = compiler.getEventListeners();
                expect((listener?.listener as MessageListener).handler('hello')).toBe('data: hello');
            });
        });
    });

    describe('interceptors', () => {
        describe('module-level', () => {
            it('interceptor in providers[] is applied to all handlers in the same module', () => {
                @Interceptor()
                class LoggingInterceptor {
                    async intercept(_: unknown, next: () => Promise<unknown>) {
                        return next();
                    }
                }

                @SlashCommand({ name: 'ping', description: 'Pong' })
                class PingHandler {
                    execute() {}
                }

                @SlashCommand({ name: 'echo', description: 'Echo' })
                class EchoHandler {
                    execute() {}
                }

                @Module({ providers: [LoggingInterceptor], handlers: [PingHandler, EchoHandler] })
                class AppModule {}

                const compiler = new ModuleCompiler(mockLogger);
                compiler.compile(AppModule);

                const [pingHandler, echoHandler] = compiler.getHandlers();
                expect(pingHandler?.interceptors).toHaveLength(1);
                expect(pingHandler?.interceptors[0]?.interceptor).toBeInstanceOf(LoggingInterceptor);
                expect(echoHandler?.interceptors).toHaveLength(1);
                expect(echoHandler?.interceptors[0]?.interceptor).toBeInstanceOf(LoggingInterceptor);
            });

            it('interceptor from a parent module is inherited by child module handlers', () => {
                @Interceptor()
                class ParentInterceptor {
                    async intercept(_: unknown, next: () => Promise<unknown>) {
                        return next();
                    }
                }

                @SlashCommand({ name: 'ping' })
                class PingHandler {
                    execute() {}
                }

                @SlashCommand({ name: 'echo' })
                class EchoHandler {
                    execute() {}
                }

                @Module({ handlers: [PingHandler] })
                class ChildModule {}

                @Module({ providers: [ParentInterceptor], imports: [ChildModule] })
                class ParentModule {}

                @Module({ imports: [ParentModule], handlers: [EchoHandler] })
                class RootModule {}

                const compiler = new ModuleCompiler(mockLogger);
                compiler.compile(RootModule);

                const [pingHandler, echoHandler] = compiler.getHandlers();
                expect(pingHandler?.interceptors).toHaveLength(1);
                expect(pingHandler?.interceptors[0]?.interceptor).toBeInstanceOf(ParentInterceptor);

                // EchoHandler is declared in RootModule, which does not import ParentModule, so it should not inherit the interceptor
                expect(echoHandler?.interceptors).toHaveLength(0);
            });

            it('parent interceptors come before child module interceptors in the pipeline', () => {
                @Interceptor()
                class ParentInterceptor {
                    async intercept(_: unknown, next: () => Promise<unknown>) {
                        return next();
                    }
                }

                @Interceptor()
                class ChildInterceptor {
                    async intercept(_: unknown, next: () => Promise<unknown>) {
                        return next();
                    }
                }

                @SlashCommand({ name: 'ping', description: 'Pong' })
                class PingHandler {
                    execute() {}
                }

                @Module({ providers: [ChildInterceptor], handlers: [PingHandler] })
                class ChildModule {}

                @Module({ providers: [ParentInterceptor], imports: [ChildModule] })
                class ParentModule {}

                const compiler = new ModuleCompiler(mockLogger);
                compiler.compile(ParentModule);

                const [handler] = compiler.getHandlers();
                expect(handler?.interceptors[0]?.interceptor).toBeInstanceOf(ParentInterceptor);
                expect(handler?.interceptors[1]?.interceptor).toBeInstanceOf(ChildInterceptor);
            });

            it('interceptor dependencies are correctly injected', () => {
                @Injectable()
                class LogService {
                    log(msg: string) {
                        return `logged: ${msg}`;
                    }
                }

                @Interceptor()
                class LoggingInterceptor {
                    constructor(public logger: LogService) {}

                    async intercept(_: unknown, next: () => Promise<unknown>) {
                        return next();
                    }
                }

                @SlashCommand({ name: 'ping', description: 'Pong' })
                class PingHandler {
                    execute() {}
                }

                @Module({ providers: [LogService, LoggingInterceptor], handlers: [PingHandler] })
                class AppModule {}

                const compiler = new ModuleCompiler(mockLogger);
                compiler.compile(AppModule);

                const [handler] = compiler.getHandlers();
                expect((handler?.interceptors[0]?.interceptor as LoggingInterceptor).logger).toBeInstanceOf(LogService);
            });
        });

        describe('@UseInterceptors', () => {
            it('handler-level interceptors are appended after module-level interceptors', () => {
                @Interceptor()
                class ModuleInterceptor {
                    async intercept(_: unknown, next: () => Promise<unknown>) {
                        return next();
                    }
                }

                @Interceptor()
                class HandlerInterceptor {
                    async intercept(_: unknown, next: () => Promise<unknown>) {
                        return next();
                    }
                }

                @SlashCommand({ name: 'ping', description: 'Pong' })
                @UseInterceptors(HandlerInterceptor)
                class PingHandler {
                    execute() {}
                }

                @Module({ providers: [ModuleInterceptor], handlers: [PingHandler] })
                class AppModule {}

                const compiler = new ModuleCompiler(mockLogger);
                compiler.compile(AppModule);

                const [handler] = compiler.getHandlers();
                expect(handler?.interceptors).toHaveLength(2);
                expect(handler?.interceptors[0]?.interceptor).toBeInstanceOf(ModuleInterceptor);
                expect(handler?.interceptors[1]?.interceptor).toBeInstanceOf(HandlerInterceptor);
            });

            it('throws when @UseInterceptors references a class not decorated with @Interceptor', () => {
                class NotAnInterceptor {}

                @SlashCommand({ name: 'ping', description: 'Pong' })
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                @UseInterceptors(NotAnInterceptor as any)
                class PingHandler {
                    execute() {}
                }

                @Module({ handlers: [PingHandler] })
                class AppModule {}

                const compiler = new ModuleCompiler(mockLogger);
                expect(() => compiler.compile(AppModule)).toThrow('is not a valid interceptor');
            });

            it('throws when the same interceptor is registered at module level and via @UseInterceptors', () => {
                @Interceptor()
                class DuplicateInterceptor {
                    async intercept(_: unknown, next: () => Promise<unknown>) {
                        return next();
                    }
                }

                @SlashCommand({ name: 'ping', description: 'Pong' })
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                @UseInterceptors(DuplicateInterceptor)
                class PingHandler {
                    execute() {}
                }

                @Module({ providers: [DuplicateInterceptor], handlers: [PingHandler] })
                class AppModule {}

                const compiler = new ModuleCompiler(mockLogger);
                expect(() => compiler.compile(AppModule)).toThrow('Duplicate interceptor');
            });
        });
    });

    describe('nested imports', () => {
        it('compiles providers from transitively imported modules', () => {
            @Injectable()
            class DeepService {}

            @Module({ providers: [DeepService] })
            class DeepModule {}

            @Module({ imports: [DeepModule] })
            class MidModule {}

            @Module({ imports: [MidModule] })
            class RootModule {}

            const compiler = new ModuleCompiler(mockLogger);
            compiler.compile(RootModule);

            expect(compiler.getContainerFor(DeepService)).toBeDefined();
        });
    });

    describe('global modules', () => {
        it('providers from a global module can be injected into modules that do not import it directly', () => {
            @Injectable()
            class SharedService {}

            @Module({ global: true, providers: [SharedService] })
            class GlobalModule {}

            @Injectable()
            class LocalService {
                constructor(public shared: SharedService) {}
            }

            // LocalModule does not import GlobalModule
            @Module({ providers: [LocalService] })
            class LocalModule {}

            @Module({ imports: [GlobalModule, LocalModule] })
            class RootModule {}

            const compiler = new ModuleCompiler(mockLogger);
            compiler.compile(RootModule);

            const instance = compiler.getContainerFor(LocalService).resolve(LocalService);
            expect(instance.shared).toBeInstanceOf(SharedService);
        });

        it('fails to inject a provider from a non-global module that is not directly imported', () => {
            @Injectable()
            class SharedService {}

            // global: true is intentionally omitted
            @Module({ providers: [SharedService] })
            class SharedModule {}

            @Injectable()
            class LocalService {
                constructor(public shared: SharedService) {}
            }

            @Module({ providers: [LocalService] })
            class LocalModule {}

            @Module({ imports: [SharedModule, LocalModule] })
            class RootModule {}

            const compiler = new ModuleCompiler(mockLogger);
            compiler.compile(RootModule);

            expect(() => compiler.getContainerFor(LocalService).resolve(LocalService)).toThrow();
        });
    });

    describe('container reuse', () => {
        it('warns and reuses the existing container when the same module is compiled twice', () => {
            @Module({})
            class AppModule {}

            const compiler = new ModuleCompiler(mockLogger);
            compiler.compile(AppModule);
            compiler.compile(AppModule);

            expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('already compiled'), 'ModuleCompiler');
        });
    });
});
