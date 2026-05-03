import { NodecordExceptionCode } from '../../enums/exceptions.js';
import { NodecordCoreException } from './base.js';

export class MissingRequiredClientOptionsException extends NodecordCoreException {
    constructor() {
        super(
            `Client options are required to initialize NodecordClient.`,
            NodecordExceptionCode.MISSING_CLIENT_OPTIONS,
        );
    }
}
