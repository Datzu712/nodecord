import { COMMAND_WATERMARK } from '@nodecord/core/constants';

export class Scanner {
    static isCommand(instance: any): boolean {
        return !!Reflect.hasMetadata(COMMAND_WATERMARK, instance);
    }
}
