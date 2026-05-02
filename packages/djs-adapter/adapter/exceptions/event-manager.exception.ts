import { DjsAdapterErrorCodes } from '../enums/exceptions.js';
import { DjsAdapterException } from './base.js';

export class MixedListenerTypeException extends DjsAdapterException {
    constructor(event: string) {
        super(`Cannot mix 'on' and 'once' listeners for event "${event}".`, DjsAdapterErrorCodes.MIXED_LISTENER_TYPE);
    }
}
