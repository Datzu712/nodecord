import { Container, type ServiceIdentifier } from 'inversify';
import type { Type } from '../../interfaces/type.js';

export class ModuleContainer {
    #container: Container;
    //#parent: ModuleContainer | undefined;

    constructor(parent?: ModuleContainer) {
        this.#container = new Container({ parent: parent ? parent.#container : undefined });
        //this.#parent = parent;
    }

    register<T>(cls: Type<T>, scope: 'singleton' | 'transient' = 'singleton'): void {
        const binding = this.#container.bind<T>(cls as ServiceIdentifier<T>).toSelf();
        if (scope === 'singleton') binding.inSingletonScope();
        else binding.inTransientScope();
    }

    resolve<T>(cls: Type<T>): T {
        if (this.#container.isBound(cls as ServiceIdentifier<T>)) {
            return this.#container.get<T>(cls as ServiceIdentifier<T>); // Inversify already looks up the parent container if the binding is not found in the current container
        }
        // if (this.#parent) {
        //     return this.#parent.resolve<T>(cls);
        // }
        throw new Error(`No binding found for ${cls.name}`);
    }
}
