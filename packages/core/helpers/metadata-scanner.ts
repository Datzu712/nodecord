import type { CommandMetadata, CategoryMetadata, ClientModuleMetadata } from '@nodecord/core/interfaces';
import { COMMAND_METADATA } from '@nodecord/core/constants';
import { Scanner } from './scanner';

const INVALID_CLASS_ERROR = (target: string, decorator: string, instanceName = 'unknown') =>
    `An invalid ${target} class was provided. Make sure that the class is decorated with @${decorator}() decorator. Class: ${instanceName}`;

export class MetadataScanner {
    public static getCommandMetadata(instance: any): CommandMetadata['metadata'] {
        if (!Scanner.isCommand(instance)) {
            throw new Error(INVALID_CLASS_ERROR('command', 'Command', instance.constructor?.name));
        }

        return Reflect.getMetadata(COMMAND_METADATA, instance) as CommandMetadata['metadata'];
    }

    public static getCategoryMetadata(instance: any): CategoryMetadata {
        if (!Scanner.isCategory(instance)) {
            throw new Error(INVALID_CLASS_ERROR('category', 'Category', instance.constructor?.name));
        }
        const category: CategoryMetadata = {
            commands: Reflect.getMetadata('commands', instance),
            metadata: Reflect.getMetadata('metadata', instance),
        };

        return category;
    }

    public static getClientModuleMetadata(instance: any): ClientModuleMetadata {
        if (!Scanner.isClientModule(instance)) {
            throw new Error(INVALID_CLASS_ERROR('client module', 'ClientModule', instance.constructor?.name));
        }
        return {
            categories: Reflect.getMetadata('categories', instance),
        } as ClientModuleMetadata;
    }

    /*public getMethodArguments(instance: any, methodName: string) {
        // todo;
    }*/
}
