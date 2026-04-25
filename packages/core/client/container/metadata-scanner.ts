import { Constructor } from '../../interfaces/common/constructor.js';
import { INJECTABLE_METADATA } from '../../constants/injectable.js';
import { HANDLER_METADATA, HANDLER_WATERMARK } from '../../constants/handler.js';
import { MODULE_ID, MODULE_METADATA } from '../../constants/module.js';
import type { ModuleMetadata } from '../../interfaces/module/module-metadata.interface.js';
import { LISTENER_METADATA, LISTENER_WATERMARK } from '../../constants/listener.js';
import type { ListenerMetadata } from '../../interfaces/listener/event-listener.js';
import type { HandlerMetadata } from '../../interfaces/handler/command-handler.js';
import { INJECTABLE_WATERMARK } from '@nestjs/common/constants.js';

export class MetadataScanner {
    static getModuleId(target: Constructor): string {
        return Reflect.getMetadata(MODULE_ID, target) as string;
    }

    static isModule(target: Constructor): boolean {
        return Reflect.hasMetadata(MODULE_METADATA, target);
    }

    static isProvider(target: Constructor): boolean {
        return Reflect.hasMetadata(INJECTABLE_WATERMARK, target);
    }

    static isHandler(target: Constructor): boolean {
        return Reflect.hasMetadata(HANDLER_WATERMARK, target);
    }

    static getModuleMetadata(target: Constructor): ModuleMetadata {
        return Reflect.getMetadata(MODULE_METADATA, target) as ModuleMetadata;
    }

    static getProviderMetadata(target: Constructor): { id: string } | undefined {
        return Reflect.getMetadata(INJECTABLE_METADATA, target) as { id: string } | undefined;
    }

    static isListener(target: Constructor): boolean {
        return Reflect.hasMetadata(LISTENER_WATERMARK, target);
    }

    static getHandlerMetadata(target: Constructor) {
        return Reflect.getMetadata(HANDLER_METADATA, target) as HandlerMetadata;
    }

    static getListenerMetadata(target: Constructor) {
        return Reflect.getMetadata(LISTENER_METADATA, target) as ListenerMetadata;
    }
}
