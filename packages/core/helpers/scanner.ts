import { COMMAND_WATERMARK, CATEGORY_WATERMARK, MAIN_MODULE_WATERMARK } from '@nodecord/core/constants';

export class Scanner {
    static isCommand(instance: any): boolean {
        const metadata = Reflect.getMetadata(COMMAND_WATERMARK, instance) as { channelInputCommand?: true };
        // console.log(!!metadata?.channelInputCommand, metadata);
        return !!metadata?.channelInputCommand;
    }
    static isSlashCommand(instance: any): boolean {
        const metadata = Reflect.getMetadata(COMMAND_WATERMARK, instance) as { slashCommand?: true };
        return !!metadata?.slashCommand;
    }
    static isCategory(instance: any): boolean {
        return !!Reflect.hasMetadata(CATEGORY_WATERMARK, instance);
    }
    static isClientModule(instance: any): boolean {
        return !!Reflect.hasMetadata(MAIN_MODULE_WATERMARK, instance);
    }
}
