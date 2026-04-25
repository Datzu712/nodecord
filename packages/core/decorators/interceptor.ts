import { injectable } from 'inversify';
import { randomUUID } from 'node:crypto';
import { INTERCEPTOR_ID, INTERCEPTOR_WATERMARK } from '../constants/interceptor.js';

export function Interceptor(): ClassDecorator {
    return (target) => {
        injectable()(target);
        Reflect.defineMetadata(INTERCEPTOR_WATERMARK, true, target);
        Reflect.defineMetadata(INTERCEPTOR_ID, randomUUID(), target);
    };
}
