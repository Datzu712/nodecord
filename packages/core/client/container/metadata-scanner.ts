import { Constructor } from '../../interfaces/common/constructor.js';
import { INJECTABLE_METADATA, INJECTABLE_WATERMARK } from '../../constants/injectable.js';
import {
    COMMAND_ARGS_METADATA,
    COMMAND_HANDLER_METADATA,
    DEFER_REPLY_METADATA,
    EXECUTIONS_METADATA,
    HANDLER_WATERMARK,
    USE_INTERCEPTORS_METADATA,
} from '../../constants/handler.js';
import { MODULE_ID, MODULE_METADATA } from '../../constants/module.js';
import type { ModuleMetadata } from '../../interfaces/module/module-metadata.interface.js';
import { LISTENER_METADATA, LISTENER_WATERMARK } from '../../constants/listener.js';
import type { ListenerMetadata } from '../../interfaces/listener/event-listener.js';
import { INTERCEPTOR_METADATA, INTERCEPTOR_WATERMARK } from '../../constants/interceptor.js';
import type { NodecordInterceptor } from '../../interfaces/interceptor/interceptor.js';
import {
    EXCEPTION_HANDLER_METADATA,
    EXCEPTION_HANDLER_WATERMARK,
    USE_EXCEPTION_HANDLER_METADATA,
} from '../../constants/exception-handler.js';
import type {
    ExceptionHandler,
    ExceptionHandlerMetadata,
} from '../../interfaces/exception-handler/exception-handler.js';
import { ParamMetadata } from '../../interfaces/index.js';
import { CommandHandlerMetadata } from '../../interfaces/handler/command-handler.js';
import { ExecutionKind } from '../../constants/execution-kind.js';
import { ExecutorMetadata } from '../../interfaces/handler/executor-metadata.js';

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

    static isInterceptor(target: Constructor): boolean {
        return Reflect.hasMetadata(INTERCEPTOR_WATERMARK, target);
    }

    static getInterceptorMetadata(target: Constructor): { id: string; type?: Constructor } {
        return Reflect.getMetadata(INTERCEPTOR_METADATA, target) as { id: string; type?: Constructor };
    }

    static getHandlerInterceptors(target: Constructor): Constructor<NodecordInterceptor>[] {
        return (
            (Reflect.getMetadata(USE_INTERCEPTORS_METADATA, target) as
                | Constructor<NodecordInterceptor>[]
                | undefined) ?? []
        );
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

    static getListenerMetadata(target: Constructor) {
        return Reflect.getMetadata(LISTENER_METADATA, target) as ListenerMetadata;
    }

    static isExceptionHandler(target: Constructor): boolean {
        return Reflect.hasMetadata(EXCEPTION_HANDLER_WATERMARK, target);
    }

    static getExceptionHandlerMetadata(target: Constructor): ExceptionHandlerMetadata {
        return Reflect.getMetadata(EXCEPTION_HANDLER_METADATA, target) as ExceptionHandlerMetadata;
    }

    static getHandlerExceptionHandlers(target: Constructor): Constructor<ExceptionHandler>[] {
        return (
            (Reflect.getMetadata(USE_EXCEPTION_HANDLER_METADATA, target) as
                | Constructor<ExceptionHandler>[]
                | undefined) ?? []
        );
    }
    static isExecutorDeferReply(target: Constructor, methodKey: string): boolean {
        return Reflect.hasMetadata(DEFER_REPLY_METADATA, target, methodKey);
    }

    static isExecutorEphemeral(target: Constructor, methodKey: string): boolean {
        console.warn('Ephemeral executors are not implemented yet. Returning false for all executors.');
        return false;
        //throw new Error('Ephemeral executors are not implemented yet'); // not implemented yet
        return Reflect.hasMetadata('TODO', target, methodKey);
    }

    static getHandlerExecutorParams(handler: Constructor, methodKey: string): ParamMetadata[] {
        return (Reflect.getMetadata(COMMAND_ARGS_METADATA, handler, methodKey) as ParamMetadata[]) ?? [];
    }

    static getCommandHandlerEntrypointMetadata(handler: Constructor) {
        return Reflect.getMetadata(COMMAND_HANDLER_METADATA, handler) as CommandHandlerMetadata | undefined;
    }

    static getCommandHandlerExecutors(
        handler: Constructor,
    ): ExecutorMetadata<Exclude<ExecutionKind, 'slashCommand'>>[] {
        return (
            (Reflect.getMetadata(EXECUTIONS_METADATA, handler) as
                | ExecutorMetadata<Exclude<ExecutionKind, 'slashCommand'>>[]
                | undefined) ?? []
        );
    }
}
