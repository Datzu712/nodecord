import type { Constructor } from '../../../interfaces/index.js';
import { InvalidInterceptorException, MissingContractMethodException } from '../../exceptions/module.js';
import { MetadataScanner } from '../metadata-scanner.js';

export function compileInterceptorMetadata(target: Constructor): { id: string; type?: Constructor } {
    if (!MetadataScanner.isInterceptor(target)) {
        throw new InvalidInterceptorException(target.name);
    }

    if (!('intercept' in target.prototype)) {
        throw new MissingContractMethodException(target.name, 'NodecordInterceptor', 'intercept');
    }

    return MetadataScanner.getInterceptorMetadata(target);
}
