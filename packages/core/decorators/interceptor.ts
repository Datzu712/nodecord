import { injectable } from 'inversify';
import { randomUUID } from 'node:crypto';
import { INTERCEPTOR_METADATA, INTERCEPTOR_WATERMARK } from '../constants/interceptor.js';
import type { Constructor } from '../interfaces/common/constructor.js';

export function Interceptor(type?: Constructor): ClassDecorator {
    return (target) => {
        injectable()(target);
        Reflect.defineMetadata(INTERCEPTOR_WATERMARK, true, target);
        Reflect.defineMetadata(INTERCEPTOR_METADATA, { id: randomUUID(), type }, target);
    };
}
