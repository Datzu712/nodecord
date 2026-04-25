import { injectable } from 'inversify';
import { randomUUID } from 'node:crypto';
import { LISTENER_ID, LISTENER_WATERMARK } from '../constants/listener.js';

export function Listener<T = unknown>(event: T): ClassDecorator {
    return (target) => {
        injectable()(target);
        Reflect.defineMetadata(LISTENER_WATERMARK, event, target);
        Reflect.defineMetadata(LISTENER_ID, randomUUID(), target); // Duplicated will be handled as methods chain
    };
}
