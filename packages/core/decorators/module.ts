import { randomUUID } from 'node:crypto';
import type { ModuleMetadata } from '../interfaces/module/module-metadata.interface.js';
import { MODULE_ID, MODULE_METADATA } from '../constants/module.js';

export function Module(metadata: ModuleMetadata): ClassDecorator {
    return (target) => {
        Reflect.defineMetadata(MODULE_METADATA, metadata, target);
        Reflect.defineMetadata(MODULE_ID, randomUUID(), target);
    };
}
