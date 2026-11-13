import { DjsAdapterErrorCodes } from '../enums/exceptions.js';
import { DjsAdapterException } from './base.js';

export class AdapterAlreadyInitializedException extends DjsAdapterException {
    constructor() {
        super(
            'Adapter is already initialized. Adapter should only be initialized by the framework once during setup.',
            DjsAdapterErrorCodes.ADAPTER_ALREADY_INITIALIZED,
        );
    }
}

export class AdapterNotInitializedException extends DjsAdapterException {
    constructor() {
        super(
            'Adapter must be initialized before login. Please ensure the client is properly set up.',
            DjsAdapterErrorCodes.ADAPTER_NOT_INITIALIZED,
        );
    }
}
