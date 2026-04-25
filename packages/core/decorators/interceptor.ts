import { injectable } from 'inversify';
import { randomUUID } from 'node:crypto';
import { INTERCEPTOR_WATERMARK } from '../constants/interceptor.js';
import { INTERCEPTORS_METADATA } from '@nestjs/common/constants.js';

export function Interceptor(): ClassDecorator {
    return (target) => {
        injectable()(target);
        Reflect.defineMetadata(INTERCEPTOR_WATERMARK, true, target);
        Reflect.defineMetadata(INTERCEPTORS_METADATA, { id: randomUUID() }, target);
    };
}
