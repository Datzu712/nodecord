import { injectable } from 'inversify';
import { randomUUID } from 'node:crypto';
import { LISTENER_METADATA, LISTENER_WATERMARK } from '../constants/listener.js';
import { ListenerMetadata } from '../interfaces/listener/event-listener.js';

export function Listener<T = unknown>(event: T, options?: { once?: boolean }): ClassDecorator {
    return (target) => {
        const metadata: ListenerMetadata = {
            id: randomUUID(),
            event,
            ...options,
        };

        injectable()(target);
        Reflect.defineMetadata(LISTENER_WATERMARK, true, target);
        Reflect.defineMetadata(LISTENER_METADATA, metadata, target);
    };
}
