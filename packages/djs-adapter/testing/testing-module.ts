import { CommandExecutor, ModuleCompiler, type Constructor } from '@nodecord/core';
import { TestingDjsAdapter } from './testing-djs-adapter.js';

const silentLogger = {
    log: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {},
    verbose: () => {},
};

export class TestingModule {
    private readonly overrides = new Map<Constructor, unknown>();
    private compiler!: ModuleCompiler;
    private adapter!: TestingDjsAdapter;

    private constructor(
        private readonly moduleClass: Constructor,
        private readonly logger = silentLogger,
    ) {}

    static create(moduleClass: Constructor): TestingModule {
        return new TestingModule(moduleClass);
    }

    overrideProvider<T>(cls: Constructor<T>, mock: T): this {
        this.overrides.set(cls, mock);
        return this;
    }

    compile(): this {
        this.adapter = new TestingDjsAdapter();
        this.compiler = new ModuleCompiler(this.logger, this.overrides);
        this.compiler.compile(this.moduleClass);

        const executor = new CommandExecutor();
        this.adapter.initialize(executor, this.compiler.getHandlers(), this.compiler.getEventListeners());

        return this;
    }

    getAdapter(): TestingDjsAdapter {
        return this.adapter;
    }

    get<T>(cls: Constructor<T>): T {
        return this.compiler.getContainerFor(cls).resolve(cls);
    }
}
