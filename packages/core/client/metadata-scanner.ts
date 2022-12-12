import type { CommandMetadata } from '@nodecord/core/interfaces';
import { COMMAND_METADATA } from '@nodecord/core/constants';
import { Scanner } from './scanner';

export class MetadataScanner {
    public getCommandMetadata(instance: any): CommandMetadata {
        if (!Scanner.isCommand(instance)) {
            throw new Error(
                `An invalid command class was provided. Make sure that the class is decorated with @Command() decorator. Class: ${
                    instance.constructor?.name || 'unknown'
                }`,
            );
        }

        return Reflect.getMetadata(COMMAND_METADATA, instance) as CommandMetadata;
    }

    /*public getCategoryMetadata(instance: any): CategoryMetadata {
        // todo;
    }

    public getClientModuleMetadata(instance: any): ClientModuleMetadata {
        // todo;
    }

    public getMethodArguments(instance: any, methodName: string) {
        // todo;
    }*/
}
