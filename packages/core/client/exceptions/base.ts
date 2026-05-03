import { NodecordExceptionCode } from '../../enums/exceptions.js';

/**
 * Open base exception class for all Nodecord exceptions. The idea is to have custom strict code types for all exceptions
 */
export abstract class BaseFrameworkException<TCode extends string = string> extends Error {
    constructor(
        message: string,
        public readonly code: TCode,
    ) {
        super(message);
        this.name = this.constructor.name;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static getDocsUrl(_code: string): string {
        throw new Error('getDocsUrl method must be implemented in subclasses of BaseFrameworkException');
    }
}

export class NodecordCoreException extends BaseFrameworkException<NodecordExceptionCode> {
    static override getDocsUrl(code: NodecordExceptionCode): string {
        return `https://datzu712.github.io/nodecord/docs/core/faq/exceptions#${code.toLowerCase()}`;
    }

    constructor(message: string, code: NodecordExceptionCode = NodecordExceptionCode.INTERNAL_ERROR) {
        let finalMessage = message;

        if (code === NodecordExceptionCode.INTERNAL_ERROR) {
            finalMessage += `\n\nAn internal error occurred. This is likely a bug in @nodecord/core. Please open an issue with the steps to reproduce this error.`;
        } else {
            finalMessage += `\n\nFor more information, please check the documentation: ${NodecordCoreException.getDocsUrl(code)}`;
        }

        super(finalMessage, code);
    }
}
