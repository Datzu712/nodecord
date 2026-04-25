import type { Constructor } from '../common/constructor.js';

export interface ModuleMetadata {
    providers?: Constructor[]; // services
    handlers?: Constructor[]; // commands
    imports?: Constructor[]; // other modules
    exports?: Constructor[]; // providers to be exported and used by other modules
    global?: boolean; // if true, the module's providers will be registered in the global container
}
