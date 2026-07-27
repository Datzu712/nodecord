import type { ListenerMetadata } from '../../../interfaces/listener/event-listener.js';
import type { Constructor } from '../../../interfaces/index.js';
import { InvalidListenerException, MissingContractMethodException } from '../../exceptions/module.js';
import { MetadataScanner } from '../metadata-scanner.js';

export function compileListenerMetadata(target: Constructor): ListenerMetadata {
    if (!MetadataScanner.isListener(target)) {
        throw new InvalidListenerException(target.name);
    }

    if (!('handler' in target.prototype)) {
        throw new MissingContractMethodException(target.name, 'ListenerProvider', 'handler');
    }

    return MetadataScanner.getListenerMetadata(target);
}
