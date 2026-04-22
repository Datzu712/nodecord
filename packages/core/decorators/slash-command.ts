import { injectable } from 'inversify';
import { randomUUID } from 'node:crypto';

import { HandlerTypes } from '../enums/command-types.enum.js';
import { HANDLER_ID, HANDLER_METADATA, HANDLER_WATERMARK } from '../constants/handler.js';
import { SlashCommandMetadata } from '../interfaces/handler/slash-command-metadata.js';

export function SlashCommand(options: SlashCommandMetadata): ClassDecorator {
    return (target) => {
        injectable()(target);
        Reflect.defineMetadata(HANDLER_WATERMARK, HandlerTypes.SLASH, target); // Watermarks indicate the type
        Reflect.defineMetadata(HANDLER_METADATA, options, target); // Metadata indicates how it behaves
        Reflect.defineMetadata(HANDLER_ID, randomUUID(), target); // Just an Id to avoid conflicts and internal lookups/validations
    };
}
