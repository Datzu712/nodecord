import { USE_EXCEPTION_HANDLER_METADATA } from '../constants/exception-handler.js';
import type { Constructor } from '../interfaces/common/constructor.js';
import type { ExceptionHandler } from '../interfaces/exception-handler/exception-handler.js';

export function UseExceptionHandler(...handlers: Constructor<ExceptionHandler>[]): ClassDecorator {
    return (target) => {
        Reflect.defineMetadata(USE_EXCEPTION_HANDLER_METADATA, handlers, target);
    };
}
