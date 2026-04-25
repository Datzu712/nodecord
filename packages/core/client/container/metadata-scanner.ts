import { Constructor } from '../../interfaces/common/constructor.js';
import { INJECTABLE_ID } from '../../constants/injectable.js';
import { HANDLER_ID, HANDLER_METADATA, HANDLER_WATERMARK } from '../../constants/handler.js';
import { MODULE_ID, MODULE_METADATA } from '../../constants/module.js';
import { ModuleMetadata } from '../../interfaces/module/module-metadata.interface.js';
import { LISTENER_ID, LISTENER_WATERMARK } from '../../constants/listener.js';
import { HandlerTypes } from '../../enums/command-types.enum.js';

export class MetadataScanner {
    static getModuleId(target: Constructor): string {
        return Reflect.getMetadata(MODULE_ID, target) as string;
    }

    static isModule(target: Constructor): boolean {
        return Reflect.hasMetadata(MODULE_METADATA, target);
    }

    static isProvider(target: Constructor): boolean {
        return Reflect.hasMetadata(INJECTABLE_ID, target);
    }

    static isHandler(target: Constructor): boolean {
        return Reflect.hasMetadata(HANDLER_WATERMARK, target);
    }

    static getModuleMetadata(target: Constructor): ModuleMetadata {
        return Reflect.getMetadata(MODULE_METADATA, target) as ModuleMetadata;
    }

    static getProviderId(target: Constructor): string | undefined {
        return Reflect.getMetadata(INJECTABLE_ID, target) as string | undefined;
    }

    static getHandlerId(target: Constructor): string | undefined {
        return Reflect.getMetadata(HANDLER_ID, target) as string | undefined;
    }

    static isListener(target: Constructor): boolean {
        return Reflect.hasMetadata(LISTENER_WATERMARK, target);
    }

    static getListenerId(target: Constructor) {
        return Reflect.getMetadata(LISTENER_ID, target) as string | undefined;
    }

    static getHandlerWatermark(target: Constructor): HandlerTypes | undefined {
        return Reflect.getMetadata(HANDLER_WATERMARK, target) as HandlerTypes | undefined;
    }

    static getHandlerMetadata(target: Constructor) {
        return Reflect.getMetadata(HANDLER_METADATA, target) as unknown;
    }

    static getListenerEvent(target: Constructor): unknown {
        return Reflect.getMetadata(LISTENER_WATERMARK, target);
    }
}
