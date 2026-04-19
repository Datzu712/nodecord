import { injectable } from 'inversify';
import { randomUUID } from 'node:crypto';

import { COMMAND_ID, COMMAND_METADATA, COMMAND_WATERMARK } from '../constants/command.js';
import { INJECTABLE_WATERMARK } from '../constants/metadata.js';
import { CommandTypes } from '../enums/command-types.enum.js';
import type { CommandMetadata } from '../interfaces/command/command-metadata.interface.js';

export type SlashCommandOptions = Omit<CommandMetadata['metadata'], 'aliases' | 'execute' | 'category'> & {
    options?: unknown;
    global?: boolean;
};

export function SlashCommand(options: SlashCommandOptions): ClassDecorator {
    return (target) => {
        injectable()(target);
        Reflect.defineMetadata(INJECTABLE_WATERMARK, true, target);
        Reflect.defineMetadata(COMMAND_WATERMARK, { type: CommandTypes.SLASH }, target);
        Reflect.defineMetadata(COMMAND_METADATA, options, target);
        Reflect.defineMetadata(COMMAND_ID, randomUUID(), target);
    };
}
