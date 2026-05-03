import { injectable } from 'inversify';
import { randomUUID } from 'node:crypto';
import { EXCEPTION_HANDLER_METADATA, EXCEPTION_HANDLER_WATERMARK } from '../constants/exception-handler.js';
import type { Constructor } from '../interfaces/common/constructor.js';
import type { ExceptionHandlerMetadata } from '../interfaces/exception-handler/exception-handler.js';

export function OnException(...exceptions: Constructor[]): ClassDecorator {
    return (target) => {
        injectable()(target);
        Reflect.defineMetadata(EXCEPTION_HANDLER_WATERMARK, true, target);
        Reflect.defineMetadata(
            EXCEPTION_HANDLER_METADATA,
            { id: randomUUID(), exceptions } satisfies ExceptionHandlerMetadata,
            target,
        );
    };
}
