import type { Type } from '../interfaces/type.js';
import { ModuleCompiler } from './container/module-compiler.js';

export class NodecordClient {
    private moduleCompiler: ModuleCompiler;

    constructor(rootModule: Type) {
        this.moduleCompiler = new ModuleCompiler();

        this.moduleCompiler.compile(rootModule);
    }

    get<T>(cls: Type<T>): T {
        const targetContainer = this.moduleCompiler.getContainerFor(cls);
        console.log(`Resolving ${cls.name} from container: ${targetContainer.constructor.name}`);
        return targetContainer.resolve(cls);
    }
}
