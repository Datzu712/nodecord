import type { Type } from '../../interfaces/common/type.js';
import { MetadataScanner } from './metadata-scanner.js';
import { ModuleContainer } from './module-container.js';
import { AbstractCommand } from '../../commands/abstract-command.js';
import { ListenerProvider } from '../../interfaces/listener/event-listener.js';

export class ModuleCompiler {
    private globalContainer = new ModuleContainer();
    private moduleMap = new Map<unknown, ModuleContainer>(); // Map<moduleId, ModuleContainer>
    private providerMap = new Map<unknown, unknown>(); // Map<providerId, moduleId>
    private handlerMap = new Map<unknown, AbstractCommand>(); // Map<handlerId, moduleId>
    private listenerMap = new Map<unknown, ListenerProvider>(); // Map<listenerId, moduleId>

    compile(parentModule: Type): ModuleContainer {
        return this.compileModule(parentModule, this.globalContainer);
    }

    getContainerFor(provider: Type): ModuleContainer {
        const providerId = MetadataScanner.getProviderId(provider);
        const moduleId = this.providerMap.get(providerId);
        if (!moduleId) {
            throw new Error(
                `${provider.name} is not registered in any module. ` +
                    `Make sure it is listed in the providers array of its module.`,
            );
        }

        const targetModule = this.moduleMap.get(moduleId);
        if (!targetModule) {
            throw new Error(
                `Internal error: ${provider.name} is mapped to a module that was not compiled. ` +
                    `This is likely a bug in ModuleCompiler.`,
            );
        }

        return targetModule;
    }

    private compileModule(moduleClass: Type, parent: ModuleContainer): ModuleContainer {
        /**
         * CJS resolves module in runtime, so that means if ModuleA imports ModuleB, but ModuleB also imports ModuleA, then when we try to resolve ModuleA,
         * it will try to resolve ModuleB first, and then when it tries to resolve ModuleA again, it will get undefined because ModuleA is not fully loaded yet
         *
         * This only happens in CJS, because ESM before runtime so it just throws an error like "ReferenceError: Cannot access 'AdminModule' before initialization"
         */
        if (!moduleClass) {
            throw new Error(
                `[${parent.moduleName}] An import resolved to ${moduleClass}. ` +
                    `This usually means a circular import between files (e.g. moduleA imports moduleB which imports moduleA). ` +
                    `Check the imports array of ${parent.moduleName}.`,
            );
        }

        if (!MetadataScanner.isModule(moduleClass)) {
            throw new Error(
                `Class ${moduleClass.name} is not a valid module. ` + `Make sure it is decorated with @Module.`,
            );
        }

        const moduleId = MetadataScanner.getModuleId(moduleClass);

        const metadata = MetadataScanner.getModuleMetadata(moduleClass);
        const container = metadata.global ? this.globalContainer : new ModuleContainer(moduleClass, parent);

        const moduleRef = this.moduleMap.get(moduleId);
        if (moduleRef) {
            console.warn(`Module ${moduleClass.name} is already compiled. Reusing existing container.`);
            return moduleRef;
        }

        console.log(`Binding module: ${moduleClass.name} as ${metadata.global ? 'global' : 'scoped'} module`);

        this.moduleMap.set(moduleId, container);
        for (const importedModule of metadata.imports ?? []) {
            this.compileModule(importedModule, container);
        }

        for (const provider of metadata.providers ?? []) {
            if (MetadataScanner.isListener(provider)) {
                const listenerId = MetadataScanner.getListenerId(provider);

                container.register(provider);
                this.listenerMap.set(listenerId, container.resolve(provider));

                continue;
            }

            if (!MetadataScanner.isProvider(provider)) {
                throw new Error(
                    `Class ${provider.name} is not a valid provider. ` + `Make sure it is decorated with @Injectable.`,
                );
            }

            const providerId = MetadataScanner.getProviderId(provider);

            this.providerMap.set(providerId, moduleId);
            container.register(provider);
        }

        for (const handler of metadata.handlers ?? []) {
            if (!MetadataScanner.isHandler(handler)) {
                throw new Error(
                    `Class ${handler.name} is not a valid command handler. ` +
                        `Make sure it is decorated with a command decorator (e.g. @SlashCommand).`,
                );
            }

            const handlerId = MetadataScanner.getHandlerId(handler);

            container.register(handler);
            this.handlerMap.set(handlerId, container.resolve(handler as Type<AbstractCommand>));
        }

        return container;
    }

    getCommandHandlers(): AbstractCommand[] {
        return Array.from(this.handlerMap.values());
    }

    getEventListeners(): ListenerProvider[] {
        return Array.from(this.listenerMap.values());
    }
}
