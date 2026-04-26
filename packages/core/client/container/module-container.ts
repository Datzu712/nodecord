import { Container, type ServiceIdentifier } from 'inversify';
import type { Constructor } from '../../interfaces/common/constructor.js';

export class ModuleContainer {
    #container: Container;
    readonly moduleName: string;

    constructor(moduleClass?: Constructor, parent?: ModuleContainer) {
        this.#container = new Container({ parent: parent ? parent.#container : undefined });
        this.moduleName = moduleClass?.name ?? 'GlobalContainer';
    }

    register<T>(cls: Constructor<T>, scope: 'singleton' | 'transient' = 'singleton'): void {
        const binding = this.#container.bind<T>(cls as ServiceIdentifier<T>).toSelf();
        if (scope === 'singleton') binding.inSingletonScope();
        else binding.inTransientScope();
    }

    resolve<T>(cls: Constructor<T>): T {
        if (this.#container.isBound(cls as ServiceIdentifier<T>)) {
            return this.#container.get<T>(cls as ServiceIdentifier<T>);
        }
        throw new Error(`[${this.moduleName}] No binding found for ${cls.name}`);
    }
}
