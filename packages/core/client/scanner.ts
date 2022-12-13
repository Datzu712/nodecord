import { COMMAND_WATERMARK, CATEGORY_WATERMARK, MAIN_MODULE_WATERMARK } from '@nodecord/core/constants';

export class Scanner {
    static isCommand(instance: any): boolean {
        return !!Reflect.hasMetadata(COMMAND_WATERMARK, instance);
    }
    static isCategory(instance: any): boolean {
        return !!Reflect.hasMetadata(CATEGORY_WATERMARK, instance);
    }
    static isClientModule(instance: any): boolean {
        return !!Reflect.hasMetadata(MAIN_MODULE_WATERMARK, instance);
    }
}
