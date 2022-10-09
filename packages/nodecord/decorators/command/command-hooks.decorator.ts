import { COMMAND_HOOKS_METADATA } from '../../constants';
import { CommandHooks } from '../../enums/command-hooks.enum';

export const CommandHookMapping =
    (hookType: CommandHooks): MethodDecorator =>
    (__: object, _: string | symbol, descriptor: PropertyDescriptor) => {
        Reflect.defineMetadata(COMMAND_HOOKS_METADATA, hookType, descriptor.value);

        return descriptor;
    };

/**
 * Decorator that marks a method as a command hook for Nodecord.
 * The method marked will be executed always when that command going to be executed (before).
 * The target method receives a `Message` or `CommandInteraction` as a first argument.
 *
 * @see TODO
 */
export const BeforeExecute = CommandHookMapping(CommandHooks.BEFORE_EXECUTE);
/**
 * Decorator that marks a method as a command hook for Nodecord.
 * The method marked will be executed after the `execute` method of the command is executed.
 * The target method receives a `Message` or `CommandInteraction` as a first argument.
 *
 * @see TODO
 */
export const AfterExecute = CommandHookMapping(CommandHooks.AFTER_EXECUTE);

/**
 * Aliases of the BeforeExecute decorator.
 * @see {@link BeforeExecute}
 */
export const PreExecute = CommandHookMapping(CommandHooks.BEFORE_EXECUTE);
/**
 * Aliases of the AfterExecute decorator.
 * @see {@link AfterExecute}
 */
export const PostExecute = CommandHookMapping(CommandHooks.AFTER_EXECUTE);
