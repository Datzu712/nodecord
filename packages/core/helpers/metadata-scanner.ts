import type { DefinedCommand, CategoryMetadata, ClientModuleMetadata } from '../interfaces';
import { COMMAND_METADATA, COMMAND_ARGS_METADATA } from '../constants/command';
import { Scanner } from './scanner';

const INVALID_CLASS_ERROR = (target: string, decorator: string, instanceName = 'unknown') =>
    `An invalid ${target} class was provided. Make sure the class is decorated with @${decorator}() decorator. Class: ${instanceName}`;

export class MetadataScanner {
    public static getCommandMetadata(instance: any): Omit<DefinedCommand, 'execute'> {
        if (!Scanner.isCommand(instance)) {
            throw new Error(INVALID_CLASS_ERROR('command', 'Command', instance.constructor?.name));
        }

        const metadata = Reflect.getMetadata(COMMAND_METADATA, instance) as DefinedCommand['metadata'];
        const argsMetadata = this.getCommandParamsMetadata(instance);

        return {
            metadata,
            params: argsMetadata,
        };
    }

    public static getCommandParamsMetadata(instance: any): DefinedCommand['params'] {
        if (!Scanner.isCommand(instance)) {
            throw new Error(INVALID_CLASS_ERROR('command', 'Command', instance.constructor?.name));
        }

        const commandParams = Reflect.getMetadata(
            COMMAND_ARGS_METADATA,
            instance,
            'execute',
        ) as DefinedCommand['params'];
        return commandParams || [];
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
