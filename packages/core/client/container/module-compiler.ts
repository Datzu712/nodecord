/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { MetadataScanner } from './metadata-scanner.js';
import { ModuleContainer } from './module-container.js';
import type { Constructor } from '../../interfaces/common/constructor.js';
import { ListenerProvider, RegisteredListener } from '../../interfaces/listener/event-listener.js';
import type { AbstractLogger } from '../../interfaces/common/abstract-logger.js';
import { CommandHandler, RegisteredCommandHandler } from '../../interfaces/handler/command-handler.js';
import type { NodecordInterceptor } from '../../interfaces/interceptor/interceptor.js';
import type {
    ExceptionHandler,
    RegisteredExceptionHandler,
} from '../../interfaces/exception-handler/exception-handler.js';
import { TESTING_OVERRIDES_METADATA } from '../../constants/testing.js';
import {
    DuplicateInterceptorException,
    InternalCompilerException,
    InvalidExceptionHandlerException,
    InvalidHandlerException,
    InvalidInterceptorException,
    InvalidListenerException,
    InvalidModuleException,
    InvalidProviderException,
    MissingContractMethodException,
    PossibleCircularImportException,
    ProviderNotFoundException,
} from '../exceptions/module.js';

interface ModuleCompileContext {
    parent: ModuleContainer;
    importIndex: number;
    importTrace: Constructor[];
    providers: Constructor[];
    handlers: Constructor[];
}

export class ModuleCompiler {
    private globalContainer = new ModuleContainer();
    private moduleMap = new Map<unknown, ModuleContainer>(); // Map<moduleId, ModuleContainer>
    private providerMap = new Map<unknown, unknown>(); // Map<providerId, moduleId>
    private handlerMap = new Map<unknown, RegisteredCommandHandler>(); // Map<handlerId, RegisteredCommandHandler>
    private listenerMap = new Map<unknown, RegisteredListener<unknown[]>>();
    private pendingHandlers: Array<{ container: ModuleContainer; handlerClasses: Constructor[] }> = [];
    private overrides: Map<Constructor, unknown> = new Map();

    constructor(private logger: AbstractLogger) {}

    compile(parentModule: Constructor): ModuleContainer {
        this.compileModule(parentModule, {
            parent: this.globalContainer,
            importIndex: -1,
            importTrace: [],
            providers: [],
            handlers: [],
        });
        this.compilePendingHandlers();
        return this.globalContainer;
    }

    getContainerFor(provider: Constructor): ModuleContainer {
        if (!MetadataScanner.isProvider(provider)) {
            throw new InvalidProviderException(provider.name);
        }

        const providerId = MetadataScanner.getProviderMetadata(provider)!.id;
        const moduleId = this.providerMap.get(providerId);
        if (!moduleId) {
            throw new ProviderNotFoundException(provider.name);
        }

        const targetModule = this.moduleMap.get(moduleId);
        if (!targetModule) {
            throw new InternalCompilerException(provider.name);
        }

        return targetModule;
    }

    private compileModule(moduleClass: Constructor | undefined, context: ModuleCompileContext): ModuleContainer {
        /**
         * CJS resolves module in runtime, so that means if ModuleA imports ModuleB, but ModuleB also imports ModuleA, then when we try to resolve ModuleA,
         * it will try to resolve ModuleB first, and then when it tries to resolve ModuleA again, it will get undefined because ModuleA is not fully loaded yet
         *
         * This only happens in CJS, because ESM just throws an error like "ReferenceError: Cannot access 'AdminModule' before initialization"
         */
        if (!moduleClass) {
            throw new PossibleCircularImportException(
                context.parent.moduleName,
                context.importIndex,
                context.importTrace,
                context.providers,
                context.handlers,
            );
        }

        const testOverrides = Reflect.getMetadata(TESTING_OVERRIDES_METADATA, moduleClass) as
            | Map<Constructor, unknown>
            | undefined;

        if (testOverrides) {
            this.overrides = testOverrides;
        }

        if (!MetadataScanner.isModule(moduleClass)) {
            throw new InvalidModuleException(moduleClass.name);
        }

        const moduleId = MetadataScanner.getModuleId(moduleClass);

        const metadata = MetadataScanner.getModuleMetadata(moduleClass);
        const container = metadata.global ? this.globalContainer : new ModuleContainer(moduleClass, context.parent);

        const moduleRef = this.moduleMap.get(moduleId);
        if (moduleRef) {
            this.logger.warn(
                `Module ${moduleClass.name} is already compiled. Reusing existing container.`,
                'ModuleCompiler',
            );
            return moduleRef;
        }

        this.logger.log(
            `Binding module: ${moduleClass.name} as ${metadata.global ? 'global' : 'scoped'} module`,
            'ModuleCompiler',
        );

        this.moduleMap.set(moduleId, container);

        /**
         * Listener and interceptor bindings are registered before imports compile so that
         * Inversify's container chain includes them. Resolution is deferred until after imports
         * so that they can depend on providers from sibling imported modules.
         */
        const listenerProviders: Constructor[] = [];
        const interceptorProviders: Constructor[] = [];

        for (const listener of metadata.listeners ?? []) {
            if (!MetadataScanner.isListener(listener)) {
                throw new InvalidListenerException(listener.name);
            }
            this.assertListenerContract(listener);
            container.register(listener);

            listenerProviders.push(listener);
        }

        const exceptionHandlerProviders: Constructor[] = [];

        for (const provider of metadata.providers ?? []) {
            if (MetadataScanner.isExceptionHandler(provider)) {
                this.assertExceptionHandlerContract(provider);
                this.registerProvider(container, provider);
                exceptionHandlerProviders.push(provider);
                continue;
            }

            if (MetadataScanner.isInterceptor(provider)) {
                this.assertInterceptorContract(provider);
                this.registerProvider(container, provider);
                interceptorProviders.push(provider);
                continue;
            }

            if (!MetadataScanner.isProvider(provider)) {
                throw new InvalidProviderException(provider.name);
            }

            const providerId = MetadataScanner.getProviderMetadata(provider)!.id;
            this.providerMap.set(providerId, moduleId);
            this.registerProvider(container, provider);
        }

        for (const importedModule of metadata.imports ?? []) {
            this.compileModule(importedModule, {
                parent: container,
                importIndex: metadata.imports!.indexOf(importedModule),
                importTrace: metadata.imports!,
                providers: metadata.providers ?? [],
                handlers: metadata.handlers ?? [],
            });
        }

        // Resolve listeners and interceptors after imports so their dependencies from imported modules are available.
        for (const provider of listenerProviders) {
            const listenerMeta = MetadataScanner.getListenerMetadata(provider);
            const instance = container.resolve<ListenerProvider>(provider);
            this.listenerMap.set(listenerMeta.id, { metadata: listenerMeta, listener: instance });
        }

        for (const provider of interceptorProviders) {
            const interceptorMeta = MetadataScanner.getInterceptorMetadata(provider);

            const instance = container.resolve<NodecordInterceptor>(provider);
            container.registerInterceptors({
                interceptor: instance,
                metadata: { type: interceptorMeta.type, id: interceptorMeta.id },
            });
        }

        for (const provider of exceptionHandlerProviders) {
            const meta = MetadataScanner.getExceptionHandlerMetadata(provider);
            const instance = container.resolve<ExceptionHandler>(provider);
            container.registerExceptionHandlers({ handler: instance, metadata: meta });
        }

        /**
         * Handlers are deferred to a second pass (compilePendingHandlers) instead of being
         * compiled here. The reason is that compileModule is called recursively for each import,
         * which means a child module's handlers would be compiled before the parent module has
         * had a chance to resolve its own interceptors. By deferring, we guarantee that when
         * getInheritedInterceptors() is called for any handler, every container in the ancestry
         * chain already has its interceptors fully populated.
         */
        if (metadata.handlers?.length) {
            this.pendingHandlers.push({ container, handlerClasses: metadata.handlers });
        }

        return container;
    }

    /**
     * Second compilation phase: compiles all handlers after the full module tree is built.
     * This guarantees that every container's interceptors are populated before handlers
     * call getInheritedInterceptors(), regardless of module depth or import order.
     */
    private compilePendingHandlers(): void {
        for (const { container, handlerClasses } of this.pendingHandlers) {
            for (const handler of handlerClasses) {
                if (!MetadataScanner.isHandler(handler)) {
                    throw new InvalidHandlerException(handler.name);
                }
                this.assertHandlerContract(handler);

                const { id: handlerId, descriptor, type: handlerType } = MetadataScanner.getHandlerMetadata(handler);
                container.register(handler);

                const resolvedHandler = container.resolve(handler) as CommandHandler;
                const scopedInterceptors = container.getInheritedInterceptors();
                const rawHandlerInterceptors = MetadataScanner.getHandlerInterceptors(handler);

                const allRegisteredInterceptors = [...scopedInterceptors];

                for (const rawHandlerInterceptor of rawHandlerInterceptors) {
                    if (!MetadataScanner.isInterceptor(rawHandlerInterceptor)) {
                        throw new InvalidInterceptorException(rawHandlerInterceptor.name);
                    }
                    this.assertInterceptorContract(rawHandlerInterceptor);

                    const meta = MetadataScanner.getInterceptorMetadata(rawHandlerInterceptor);
                    if (allRegisteredInterceptors.some((i) => i.metadata.id === meta.id)) {
                        throw new DuplicateInterceptorException(rawHandlerInterceptor.name, handler.name);
                    }

                    container.register(rawHandlerInterceptor);
                    allRegisteredInterceptors.push({
                        interceptor: container.resolve<NodecordInterceptor>(rawHandlerInterceptor),
                        metadata: { type: meta.type, id: meta.id },
                    });
                }

                // Handler-level exception handlers take priority over module-level ones.
                const rawHandlerExceptionHandlers = MetadataScanner.getHandlerExceptionHandlers(handler);
                const handlerLevelExceptionHandlers: RegisteredExceptionHandler[] = [];

                for (const rawExceptionHandler of rawHandlerExceptionHandlers) {
                    if (!MetadataScanner.isExceptionHandler(rawExceptionHandler)) {
                        throw new InvalidExceptionHandlerException(rawExceptionHandler.name);
                    }
                    this.assertExceptionHandlerContract(rawExceptionHandler);

                    const meta = MetadataScanner.getExceptionHandlerMetadata(rawExceptionHandler);
                    container.register(rawExceptionHandler);
                    handlerLevelExceptionHandlers.push({
                        handler: container.resolve<ExceptionHandler>(rawExceptionHandler),
                        metadata: meta,
                    });
                }

                this.handlerMap.set(handlerId, {
                    handler: resolvedHandler,
                    descriptor,
                    type: handlerType,
                    interceptors: allRegisteredInterceptors,
                    exceptionHandlers: [...handlerLevelExceptionHandlers, ...container.getInheritedExceptionHandlers()],
                });
            }
        }
    }

    private registerProvider(container: ModuleContainer, cls: Constructor): void {
        if (this.overrides.has(cls)) {
            container.registerConstant(cls, this.overrides.get(cls));
        } else {
            container.register(cls);
        }
    }

    // private isListenerProvider(cls: Constructor): cls is Constructor<ListenerProvider> {
    //     return MetadataScanner.isListener(cls) && 'handler' in cls.prototype;
    // }

    private assertListenerContract(cls: Constructor): void {
        if (!('handler' in cls.prototype)) {
            throw new MissingContractMethodException(cls.name, 'ListenerProvider', 'handler');
        }
    }

    private assertHandlerContract(cls: Constructor): void {
        if (!('execute' in cls.prototype)) {
            throw new MissingContractMethodException(cls.name, 'CommandHandler', 'execute');
        }
    }

    private assertInterceptorContract(cls: Constructor): void {
        if (!('intercept' in cls.prototype)) {
            throw new MissingContractMethodException(cls.name, 'NodecordInterceptor', 'intercept');
        }
    }

    private assertExceptionHandlerContract(cls: Constructor): void {
        if (!('handle' in cls.prototype)) {
            throw new MissingContractMethodException(cls.name, 'ExceptionHandler', 'handle');
        }
    }

    getHandlers(): RegisteredCommandHandler[] {
        return Array.from(this.handlerMap.values());
    }

    getEventListeners(): RegisteredListener<unknown[]>[] {
        return Array.from(this.listenerMap.values());
    }
}
