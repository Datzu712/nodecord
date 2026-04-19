import { MODULE_METADATA } from '../../constants/metadata.js';
import type { ModuleMetadata } from '../../interfaces/module-metadata.interface.js';
import type { Type } from '../../interfaces/type.js';
import { MetadataScanner } from './metadata-scanner.js';
import { ModuleContainer } from './module-container.js';

/**
 * RootModule
 * -> imports: [ModuleA, ModuleB]
 * -> providers: [ServiceA, ServiceB]
 * -> handlers: [CommandA, CommandB]
 *
 * ModuleA
 * -> imports: [ModuleC]
 * -> providers: [ServiceC]
 * -> handlers: [CommandC]
 */

export class ModuleCompiler {
    private globalContainer = new ModuleContainer();
    private moduleMap = new Map<unknown, ModuleContainer>(); // Map<moduleId, ModuleContainer>
    private providerMap = new Map<unknown, unknown>(); // Map<providerId, moduleId>

    compile(parentModule: Type): ModuleContainer {
        return this.compileModule(parentModule, this.globalContainer);
    }

    getContainerFor(provider: Type): ModuleContainer {
        const providerId = MetadataScanner.getProviderId(provider);
        const moduleId = this.providerMap.get(providerId);
        if (!moduleId) {
            throw new Error(`Provider ${provider.name} is not registered in any module`);
        }

        const targetModule = this.moduleMap.get(moduleId);
        if (!targetModule) {
            throw new Error(`Module with ID ${String(moduleId)} not found for provider ${provider.name}`);
        }

        return targetModule;
    }

    private compileModule(moduleClass: Type, parent: ModuleContainer): ModuleContainer {
        const moduleId = MetadataScanner.getModuleId(moduleClass);

        const metadata: ModuleMetadata = Reflect.getMetadata(MODULE_METADATA, moduleClass) ?? {};
        const container = metadata.global ? this.globalContainer : new ModuleContainer(parent);

        const moduleRef = this.moduleMap.get(moduleId);
        if (moduleRef) {
            console.warn(`Module ${moduleClass.name} is already compiled. Reusing existing container.`);
            return moduleRef;
        }

        console.log(`Binding module: ${moduleClass.name} as ${metadata.global ? 'global' : 'scoped'} module`);

        this.moduleMap.set(moduleId, container);

        for (const imported of metadata.imports ?? []) {
            this.compileModule(imported, container);
        }

        for (const provider of metadata.providers ?? []) {
            const providerId = MetadataScanner.getProviderId(provider);

            this.providerMap.set(providerId, moduleId);
            container.register(provider);
        }

        for (const handler of metadata.handlers ?? []) {
            container.register(handler);
        }

        return container;
    }
}
