import { randomUUID } from 'node:crypto';
import { MODULE_ID, MODULE_METADATA } from '../constants/metadata.js';
import type { ModuleMetadata } from '../interfaces/module-metadata.interface.js';

export function Module(metadata: ModuleMetadata): ClassDecorator {
    return (target) => {
        Reflect.defineMetadata(MODULE_METADATA, metadata, target);
        Reflect.defineMetadata(MODULE_ID, Symbol(randomUUID()), target);
    };
}
