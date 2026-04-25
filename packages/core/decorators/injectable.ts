import { injectable } from 'inversify';
import { INJECTABLE_ID, INJECTABLE_WATERMARK } from '../constants/injectable.js';
import { randomUUID } from 'node:crypto';

export function Injectable(): ClassDecorator {
    return (target) => {
        injectable()(target);
        Reflect.defineMetadata(INJECTABLE_WATERMARK, true, target);
        Reflect.defineMetadata(INJECTABLE_ID, randomUUID(), target);
    };
}
