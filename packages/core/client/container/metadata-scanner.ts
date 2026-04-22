import { Type } from '../../interfaces/common/type.js';
import { INJECTABLE_ID } from '../../constants/injectable.js';
import { HANDLER_ID, HANDLER_WATERMARK } from '../../constants/handler.js';
import { MODULE_ID, MODULE_METADATA } from '../../constants/module.js';
import { ModuleMetadata } from '../../interfaces/module/module-metadata.interface.js';
import { LISTENER_ID, LISTENER_WATERMARK } from '../../constants/listener.js';

export class MetadataScanner {
    static getModuleId(target: Type): string {
        return Reflect.getMetadata(MODULE_ID, target);
    }

    static isModule(target: Type): boolean {
        return Reflect.hasMetadata(MODULE_METADATA, target);
    }

    static isProvider(target: Type): boolean {
        return Reflect.hasMetadata(INJECTABLE_ID, target);
    }

    static isHandler(target: Type): boolean {
        return Reflect.hasMetadata(HANDLER_WATERMARK, target);
    }

    static getModuleMetadata(target: Type): ModuleMetadata {
        return Reflect.getMetadata(MODULE_METADATA, target);
    }

    static getProviderId(target: Type): string | undefined {
        return Reflect.getMetadata(INJECTABLE_ID, target);
    }

    static getHandlerId(target: Type): string | undefined {
        return Reflect.getMetadata(HANDLER_ID, target);
    }

    static isListener(target: Type): boolean {
        return Reflect.hasMetadata(LISTENER_WATERMARK, target);
    }

    static getListenerId(target: Type): string | undefined {
        return Reflect.getMetadata(LISTENER_ID, target);
    }
}
