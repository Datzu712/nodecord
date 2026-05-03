import { Container, type ServiceIdentifier } from 'inversify';
import type { Constructor } from '../../interfaces/common/constructor.js';
import { RegisteredExceptionHandler, RegisteredInterceptor } from '../../interfaces/index.js';
import { UnresolvedBindingException } from '../exceptions/module.js';

/**
 * Scoped DI container for a single module, backed by Inversify.
 *
 * Containers form a parent-child hierarchy that mirrors the module import tree.
 * Child containers can resolve providers registered in any ancestor, which is
 * handled automatically by Inversify when a parent container is supplied.
 */
export class ModuleContainer {
    #container: Container;
    readonly moduleName: string;

    private parentContainer?: ModuleContainer | undefined;
    private interceptors: RegisteredInterceptor[] = [];
    private exceptionHandlers: RegisteredExceptionHandler[] = [];

    constructor(moduleClass?: Constructor, parent?: ModuleContainer) {
        this.#container = new Container({ parent: parent ? parent.#container : undefined });
        this.moduleName = moduleClass?.name ?? 'GlobalContainer';
        this.parentContainer = parent;
    }

    register<T>(cls: Constructor<T>, scope: 'singleton' | 'transient' = 'singleton'): void {
        const binding = this.#container.bind<T>(cls).toSelf();
        if (scope === 'singleton') binding.inSingletonScope();
        else binding.inTransientScope();
    }

    resolve<T>(cls: Constructor<T>): T {
        if (this.#container.isBound(cls)) {
            return this.#container.get<T>(cls as ServiceIdentifier<T>);
        }
        throw new UnresolvedBindingException(cls.name, this.moduleName);
    }

    registerInterceptors(...interceptors: RegisteredInterceptor[]): void {
        this.interceptors.push(...interceptors);
    }

    registerExceptionHandlers(...handlers: RegisteredExceptionHandler[]): void {
        this.exceptionHandlers.push(...handlers);
    }

    registerConstant<T>(cls: Constructor<T>, value: T): void {
        this.#container.bind<T>(cls).toConstantValue(value);
    }

    /**
     * Returns all interceptors that apply to handlers in this module,
     * ordered from outermost to innermost scope: global → parent → current.
     *
     * This ensures broader interceptors (e.g. logging, auth) wrap the handler
     * before more specific ones defined closer to the handler itself.
     */
    getInheritedInterceptors(): RegisteredInterceptor[] {
        const chain: RegisteredInterceptor[] = [];
        let current: ModuleContainer | undefined = this.parentContainer;
        while (current) {
            // unshift keeps ancestor interceptors at the front as we walk up
            chain.unshift(...current.interceptors);
            current = current.parentContainer;
        }
        return [...chain, ...this.interceptors];
    }

    getInheritedExceptionHandlers(): RegisteredExceptionHandler[] {
        let chain: RegisteredExceptionHandler[] = [];
        let current: ModuleContainer | undefined = this.parentContainer;
        while (current) {
            chain = current.exceptionHandlers.concat(chain);
            current = current.parentContainer;
        }
        return chain.concat(this.exceptionHandlers);
    }
}
