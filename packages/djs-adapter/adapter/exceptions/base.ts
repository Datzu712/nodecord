import { BaseFrameworkException } from '@nodecord/core';
import { DjsAdapterErrorCodes } from '../enums/exceptions.js';

export class DjsAdapterException extends BaseFrameworkException<DjsAdapterErrorCodes> {
    constructor(message: string, code: DjsAdapterErrorCodes) {
        let finalMessage = message;

        if (code === DjsAdapterErrorCodes.INTERNAL_ADAPTER_ERROR) {
            finalMessage += `\n\nAn internal error occurred. This is likely a bug in @nodecord/djs-adapter. Please open an issue with the steps to reproduce this error.`;
        } else {
            finalMessage += `\n\nFor more information, please check the documentation: ${DjsAdapterException.getDocsUrl(code)}`;
        }

        super(finalMessage, code);
    }

    static override getDocsUrl(code: DjsAdapterErrorCodes): string {
        return 'https://datzu712.github.io/nodecord/docs/djs-adapter/faq/exceptions#' + code.toLowerCase();
    }
}
