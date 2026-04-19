import type { Type } from '../interfaces/type.js';
import { ModuleCompiler } from './container/module-compiler.js';

export class NodecordClient {
    private rootModuleCompiler: ModuleCompiler;

    constructor(rootModule: Type) {
        this.rootModuleCompiler = new ModuleCompiler();

        this.rootModuleCompiler.compile(rootModule);
    }

    resolve<T>(cls: Type<T>): T {
        const targetContainer = this.rootModuleCompiler.getContainerFor(cls);
        console.log(`Resolving ${cls.name} from container: ${targetContainer.constructor.name}`);
        return targetContainer.resolve(cls);
    }
}
