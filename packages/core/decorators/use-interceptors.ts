import { USE_INTERCEPTORS_METADATA } from '../constants/handler.js';
import type { Constructor } from '../interfaces/common/constructor.js';
import type { NodecordInterceptor } from '../interfaces/interceptor/interceptor.js';

export function UseInterceptors(...interceptors: Constructor<NodecordInterceptor>[]): ClassDecorator {
    return (target) => {
        Reflect.defineMetadata(USE_INTERCEPTORS_METADATA, interceptors, target);
    };
}
