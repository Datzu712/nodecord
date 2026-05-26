import { DEFER_REPLY_METADATA } from '../constants/handler.js';

export function DeferReply(): MethodDecorator {
    return (target, key) => {
        Reflect.defineMetadata(DEFER_REPLY_METADATA, true, target.constructor, key as string);
    };
}
