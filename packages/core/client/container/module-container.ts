import { Container, type ServiceIdentifier } from 'inversify';
import type { Type } from '../../interfaces/common/type.js';

export class ModuleContainer {
    #container: Container;
    readonly moduleName: string;

    constructor(moduleClass?: Type, parent?: ModuleContainer) {
        this.#container = new Container({ parent: parent ? parent.#container : undefined });
        this.moduleName = moduleClass?.name ?? 'GlobalContainer';
    }

    register<T>(cls: Type<T>, scope: 'singleton' | 'transient' = 'singleton'): void {
        const binding = this.#container.bind<T>(cls as ServiceIdentifier<T>).toSelf();
        if (scope === 'singleton') binding.inSingletonScope();
        else binding.inTransientScope();
    }

    resolve<T>(cls: Type<T>): T {
        if (this.#container.isBound(cls as ServiceIdentifier<T>)) {
            return this.#container.get<T>(cls as ServiceIdentifier<T>);
        }
        throw new Error(`[${this.moduleName}] No binding found for ${cls.name}`);
    }
}
