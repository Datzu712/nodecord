import type { Type } from '../common/type.js';

export interface ModuleMetadata {
    providers?: Type[]; // services
    handlers?: Type[]; // commands
    imports?: Type[]; // other modules
    exports?: Type[]; // providers to be exported and used by other modules
    global?: boolean; // if true, the module's providers will be registered in the global container
}
