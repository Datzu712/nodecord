import type { Constructor } from '../common/constructor.js';
import type { CommandHandler } from '../handler/command-handler.js';
import type { ListenerProvider } from '../listener/event-listener.js';

export interface ModuleMetadata {
    providers?: Constructor[]; // services, interceptors and exception handlers
    handlers?: Constructor<CommandHandler>[]; // commands
    imports?: Constructor[]; // other modules
    listeners?: Constructor<ListenerProvider<any>>[]; // events

    //exports?: Constructor[]; // providers to be exported and used by other modules
    global?: boolean; // if true, the module's providers will be registered in the global container
}
