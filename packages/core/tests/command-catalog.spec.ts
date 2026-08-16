import 'reflect-metadata';

import { describe, expect, it } from 'vitest';

import {
    AbstractClientAdapter,
    type InitAdapterOptions,
    type LoadSlashCommandsOptions,
} from '../client/abstract-client-adapter.js';
import { CommandCatalog } from '../client/command-catalog.js';
import { ModuleCompiler } from '../client/container/module-compiler.js';
import { DuplicateCommandNameException } from '../client/exceptions/module.js';
import { NodecordClient } from '../client/nodecord-client.js';
import type { AbstractLogger } from '../interfaces/common/abstract-logger.js';
import type { CompiledCommandHandler } from '../interfaces/handler/command-handler.js';
import { Module } from '../decorators/module.js';
import { SlashCommand } from '../decorators/slash-command.js';

const mockLogger: AbstractLogger = {
    log: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {},
    verbose: () => {},
};

class StubAdapter extends AbstractClientAdapter<unknown> {
    capturedOptions?: InitAdapterOptions;

    constructor() {
        super({});
    }

    initialize(options: InitAdapterOptions): void {
        this.capturedOptions = options;
    }

    async login(): Promise<void> {}

    async loadSlashCommands(_options: LoadSlashCommandsOptions): Promise<void> {}

    getClient() {
        return this.clientInstance;
    }
}

describe('CommandCatalog', () => {
    describe('construction from ModuleCompiler.getHandlers()', () => {
        it('exposes commands contributed by a root module and an imported child module', () => {
            @SlashCommand({ name: 'echo', description: 'Echo' })
            class EchoHandler {
                execute() {}
            }

            @Module({ handlers: [EchoHandler] })
            class ChildModule {}

            @SlashCommand({ name: 'ping', description: 'Pong' })
            class PingHandler {
                execute() {}
            }

            @Module({ imports: [ChildModule], handlers: [PingHandler] })
            class RootModule {}

            const compiler = new ModuleCompiler(mockLogger);
            compiler.compile(RootModule);

            const catalog = new CommandCatalog(compiler.getHandlers());

            expect(catalog.size).toBe(2);
            expect(catalog.getAll()).toHaveLength(2);
            expect(catalog.getByName('ping')?.metadata.name).toBe('ping');
            expect(catalog.getByName('echo')?.metadata.name).toBe('echo');
        });
    });

    describe('duplicate detection', () => {
        it('throws DuplicateCommandNameException when two handlers across different modules share name and applicationCommandType', () => {
            @SlashCommand({ name: 'ping', description: 'Pong' })
            class PingHandlerA {
                execute() {}
            }

            @Module({ handlers: [PingHandlerA] })
            class ChildModule {}

            @SlashCommand({ name: 'ping', description: 'Also pong' })
            class PingHandlerB {
                execute() {}
            }

            @Module({ imports: [ChildModule], handlers: [PingHandlerB] })
            class RootModule {}

            const compiler = new ModuleCompiler(mockLogger);
            compiler.compile(RootModule);

            expect(() => new CommandCatalog(compiler.getHandlers())).toThrow(DuplicateCommandNameException);
            expect(() => new CommandCatalog(compiler.getHandlers())).toThrow(/ping/);
        });
    });

    describe('getByName', () => {
        it('returns undefined for an unknown command name', () => {
            @SlashCommand({ name: 'ping', description: 'Pong' })
            class PingHandler {
                execute() {}
            }

            @Module({ handlers: [PingHandler] })
            class AppModule {}

            const compiler = new ModuleCompiler(mockLogger);
            compiler.compile(AppModule);

            const catalog = new CommandCatalog(compiler.getHandlers());
            expect(catalog.getByName('unknown')).toBeUndefined();
        });
    });

    describe('read-only semantics', () => {
        it('is not affected by mutations to the input array after construction', () => {
            @SlashCommand({ name: 'ping', description: 'Pong' })
            class PingHandler {
                execute() {}
            }

            @Module({ handlers: [PingHandler] })
            class AppModule {}

            const compiler = new ModuleCompiler(mockLogger);
            compiler.compile(AppModule);

            const handlers = compiler.getHandlers();
            const catalog = new CommandCatalog(handlers);

            handlers.push({
                ...handlers[0]!,
                metadata: { ...handlers[0]!.metadata, name: 'injected' },
            });

            expect(catalog.size).toBe(1);
            expect(catalog.getByName('injected')).toBeUndefined();
        });

        it('returns a frozen array from getAll() that cannot be mutated', () => {
            @SlashCommand({ name: 'ping', description: 'Pong' })
            class PingHandler {
                execute() {}
            }

            @Module({ handlers: [PingHandler] })
            class AppModule {}

            const compiler = new ModuleCompiler(mockLogger);
            compiler.compile(AppModule);

            const catalog = new CommandCatalog(compiler.getHandlers());
            const all = catalog.getAll();

            expect(Object.isFrozen(all)).toBe(true);
            expect(() => (all as CompiledCommandHandler[]).push({} as CompiledCommandHandler)).toThrow(TypeError);
            expect(catalog.size).toBe(1);
        });
    });
});

describe('NodecordClient + CommandCatalog integration', () => {
    it('passes a CommandCatalog containing the module commands to the adapter', () => {
        @SlashCommand({ name: 'ping', description: 'Pong' })
        class PingHandler {
            execute() {}
        }

        @Module({ handlers: [PingHandler] })
        class AppModule {}

        const stubAdapter = new StubAdapter();

        NodecordClient.create({
            module: AppModule,
            adapter: stubAdapter,
            options: { logger: false },
        });

        expect(stubAdapter.capturedOptions?.commands).toBeInstanceOf(CommandCatalog);
        expect(stubAdapter.capturedOptions?.commands.size).toBe(1);
        expect(stubAdapter.capturedOptions?.commands.getByName('ping')?.metadata.name).toBe('ping');
    });

    it('carries the exact @SlashCommand() definition object through to the catalog by identity', () => {
        const builder = { toJSON: () => ({ name: 'ping', description: 'Pong' }) };

        @SlashCommand(builder)
        class PingHandler {
            execute() {}
        }

        @Module({ handlers: [PingHandler] })
        class AppModule {}

        const stubAdapter = new StubAdapter();

        NodecordClient.create({
            module: AppModule,
            adapter: stubAdapter,
            options: { logger: false },
        });

        expect(stubAdapter.capturedOptions?.commands.getByName('ping')?.definition).toBe(builder);
    });

    it('throws when the module tree has duplicate command names', () => {
        @SlashCommand({ name: 'ping', description: 'Pong' })
        class PingHandlerA {
            execute() {}
        }

        @Module({ handlers: [PingHandlerA] })
        class ChildModule {}

        @SlashCommand({ name: 'ping', description: 'Also pong' })
        class PingHandlerB {
            execute() {}
        }

        @Module({ imports: [ChildModule], handlers: [PingHandlerB] })
        class RootModule {}

        expect(() =>
            NodecordClient.create({
                module: RootModule,
                adapter: new StubAdapter(),
                options: { logger: false },
            }),
        ).toThrow(DuplicateCommandNameException);
    });
});
