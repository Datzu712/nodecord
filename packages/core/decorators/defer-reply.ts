import { DEFER_REPLY_METADATA } from '../constants/handler.js';

export function DeferReply(): MethodDecorator {
    return (target, key) => {
        // Todo: check for use cases for deferring replies in other places...
        // todo: decorators should NOT throw errores.
        if (key !== 'execute') {
            throw new Error('@DeferReply can only be applied to the execute method of a CommandHandler');
        }

        Reflect.defineMetadata(DEFER_REPLY_METADATA, true, target.constructor, key as string);
    };
}
