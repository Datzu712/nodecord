import type { ExceptionHandlerMetadata } from '../../../interfaces/exception-handler/exception-handler.js';
import type { Constructor } from '../../../interfaces/index.js';
import { InvalidExceptionHandlerException, MissingContractMethodException } from '../../exceptions/module.js';
import { MetadataScanner } from '../metadata-scanner.js';

export function compileExceptionHandlerMetadata(target: Constructor): ExceptionHandlerMetadata {
    if (!MetadataScanner.isExceptionHandler(target)) {
        throw new InvalidExceptionHandlerException(target.name);
    }

    if (!('handle' in target.prototype)) {
        throw new MissingContractMethodException(target.name, 'ExceptionHandler', 'handle');
    }

    return MetadataScanner.getExceptionHandlerMetadata(target);
}
