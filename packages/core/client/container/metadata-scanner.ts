import type { ModuleMetadata } from '@nestjs/common';
import { MODULE_METADATA } from '@nestjs/common/constants.js';
import { Type } from '../../interfaces/type.js';
import { INJECTABLE_ID, MODULE_ID } from '../../constants/metadata.js';
import { COMMAND_ID } from '../../constants/command.js';

// todo remove watermarks or use them as uuids idk
export class MetadataScanner {
    static getModuleId(target: Type): Symbol {
        const moduleId = Reflect.getMetadata(MODULE_ID, target);
        if (!moduleId) {
            throw new Error(`Class ${target.name} is not decorated with @Module`);
        }
        return moduleId;
    }

    static getModuleMetadata(target: Type): ModuleMetadata {
        const metadata = Reflect.getMetadata(MODULE_METADATA, target);
        if (!metadata) {
            throw new Error(`Class ${target.name} is not decorated with @Module`);
        }
        return metadata;
    }

    static getProviderId(target: Type): Symbol {
        const providerId = Reflect.getMetadata(INJECTABLE_ID, target);
        if (!providerId) {
            throw new Error(`Class ${target.name} is not decorated with @Injectable`);
        }
        return providerId;
    }

    static getCommandId(target: Type): Symbol {
        const commandId = Reflect.getMetadata(COMMAND_ID, target);
        if (!commandId) {
            throw new Error(`Class ${target.name} is not decorated with a command decorator`);
        }
        return commandId;
    }
}
