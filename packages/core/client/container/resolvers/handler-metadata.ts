import { CompiledCommandHandler } from '../../../interfaces/handler/command-handler.js';
import { Constructor } from '../../../interfaces/index.js';
import { InvalidHandlerException, MissingContractMethodException } from '../../exceptions/module.js';
import { MetadataScanner } from '../metadata-scanner.js';

export function compileHandlerMetadata(target: Constructor): CompiledCommandHandler {
    if (!MetadataScanner.isHandler(target)) {
        throw new InvalidHandlerException(target.name);
    }

    if (!('execute' in target.prototype)) {
        throw new MissingContractMethodException(target.name, 'CommandHandler', 'execute');
    }

    const shouldDefer = MetadataScanner.isDeferReply(target);
    const autocompleteEntries = MetadataScanner.getAutocompleteEntries(target);
    const metadata = MetadataScanner.getHandlerMetadata(target);

    return {
        metadata,
        executeOptions: {
            shouldDefer,
            params: MetadataScanner.getHandlerParams(target),
        },
        autocompleteEntries,
    };
}
