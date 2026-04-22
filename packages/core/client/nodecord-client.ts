import type { Type } from '../interfaces/common/type.js';
import { CommandRegistry } from './command-registry.js';
import { ModuleCompiler } from './container/module-compiler.js';

export class NodecordClient {
    private moduleCompiler: ModuleCompiler;
    private commandRegistry = new CommandRegistry();

    constructor(rootModule: Type) {
        this.moduleCompiler = new ModuleCompiler();

        this.moduleCompiler.compile(rootModule);

        this.init();
    }

    private init() {
        const handlers = this.moduleCompiler.getCommandHandlers();
        handlers.forEach((handler) => this.commandRegistry.register(handler));
    }

    get<T>(cls: Type<T>): T {
        const targetContainer = this.moduleCompiler.getContainerFor(cls);
        console.log(`Resolving ${cls.name} from container: ${targetContainer.constructor.name}`);
        return targetContainer.resolve(cls);
    }
}
