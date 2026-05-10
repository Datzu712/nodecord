/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { MetadataScanner } from './metadata-scanner.js';
import { ModuleContainer } from './module-container.js';
import type { Constructor } from '../../interfaces/common/constructor.js';
import type {
    ListenerMetadata,
    ListenerProvider,
    RegisteredListener,
} from '../../interfaces/listener/event-listener.js';
import type { AbstractLogger } from '../../interfaces/common/abstract-logger.js';
import { CommandHandler, RegisteredCommandHandler } from '../../interfaces/handler/command-handler.js';
import type { NodecordInterceptor } from '../../interfaces/interceptor/interceptor.js';
import type {
    ExceptionHandler,
    ExceptionHandlerMetadata,
    RegisteredExceptionHandler,
} from '../../interfaces/exception-handler/exception-handler.js';
import { TESTING_OVERRIDES_METADATA } from '../../constants/testing.js';
import {
    DuplicateInterceptorException,
    InternalCompilerException,
    InvalidModuleException,
    InvalidProviderException,
    PossibleCircularImportException,
    ProviderNotFoundException,
} from '../exceptions/module.js';
import { compileHandlerMetadata } from './resolvers/handler-metadata.js';
import { compileListenerMetadata } from './resolvers/listener-metadata.js';
import { compileInterceptorMetadata } from './resolvers/interceptor-metadata.js';
import { compileExceptionHandlerMetadata } from './resolvers/exception-handler-metadata.js';

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
        this.registerPendingHandlers();
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
        const listenerProviders: Array<{ cls: Constructor; meta: ListenerMetadata }> = [];
        const interceptorProviders: Array<{ cls: Constructor; meta: { id: string; type?: Constructor } }> = [];

        for (const listener of metadata.listeners ?? []) {
            const meta = compileListenerMetadata(listener);
            container.register(listener);
            listenerProviders.push({ cls: listener, meta });
        }

        const exceptionHandlerProviders: Array<{ cls: Constructor; meta: ExceptionHandlerMetadata }> = [];

        for (const provider of metadata.providers ?? []) {
            if (MetadataScanner.isExceptionHandler(provider)) {
                const meta = compileExceptionHandlerMetadata(provider);
                this.registerProvider(container, provider);
                exceptionHandlerProviders.push({ cls: provider, meta });
                continue;
            }

            if (MetadataScanner.isInterceptor(provider)) {
                const meta = compileInterceptorMetadata(provider);
                this.registerProvider(container, provider);
                interceptorProviders.push({ cls: provider, meta });
                continue;
            }

            if (!MetadataScanner.isProvider(provider)) {
                throw new InvalidProviderException(provider.name);
            }

            const providerId = MetadataScanner.getProviderMetadata(provider)!.id;
            this.providerMap.set(providerId, moduleId);
            this.registerProvider(container, provider);
        }

        for (const [i, importedModule] of (metadata.imports ?? []).entries()) {
            this.compileModule(importedModule, {
                parent: container,
                importIndex: i,
                importTrace: metadata.imports!,
                providers: metadata.providers ?? [],
                handlers: metadata.handlers ?? [],
            });
        }

        // Resolve listeners and interceptors after imports so their dependencies from imported modules are available.
        for (const { cls, meta } of listenerProviders) {
            const instance = container.resolve<ListenerProvider>(cls);
            this.listenerMap.set(meta.id, { metadata: meta, listener: instance });
        }

        for (const { cls, meta } of interceptorProviders) {
            const instance = container.resolve<NodecordInterceptor>(cls);
            container.registerInterceptors({
                interceptor: instance,
                metadata: { type: meta.type, id: meta.id },
            });
        }

        for (const { cls, meta } of exceptionHandlerProviders) {
            const instance = container.resolve<ExceptionHandler>(cls);
            container.registerExceptionHandlers({ handler: instance, metadata: meta });
        }

        /**
         * Handlers are deferred to a second pass (registerPendingHandlers) instead of being
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
    private registerPendingHandlers(): void {
        for (const { container, handlerClasses } of this.pendingHandlers) {
            for (const handler of handlerClasses) {
                const compiledHandler = compileHandlerMetadata(handler);

                container.register(handler);

                const resolvedHandler = container.resolve(handler) as CommandHandler;
                const scopedInterceptors = container.getInheritedInterceptors();
                const rawHandlerInterceptors = MetadataScanner.getHandlerInterceptors(handler);

                const allRegisteredInterceptors = [...scopedInterceptors];

                for (const rawHandlerInterceptor of rawHandlerInterceptors) {
                    const meta = compileInterceptorMetadata(rawHandlerInterceptor);

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
                    const meta = compileExceptionHandlerMetadata(rawExceptionHandler);
                    container.register(rawExceptionHandler);
                    handlerLevelExceptionHandlers.push({
                        handler: container.resolve<ExceptionHandler>(rawExceptionHandler),
                        metadata: meta,
                    });
                }

                this.handlerMap.set(compiledHandler.metadata.id, {
                    ...compiledHandler,
                    handler: resolvedHandler,
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

    getHandlers(): RegisteredCommandHandler[] {
        return Array.from(this.handlerMap.values());
    }

    getEventListeners(): RegisteredListener<unknown[]>[] {
        return Array.from(this.listenerMap.values());
    }
}
