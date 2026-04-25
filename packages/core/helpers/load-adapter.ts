import { createRequire } from 'node:module';
import { ConsoleLogger } from '../client/console-logger.js';

const _require = createRequire(process.cwd() + '/index.js');
const logger = new ConsoleLogger('NodecordClient');

function MISSING_REQUIRED_DEPENDENCY(dependencyName: string) {
    return `Missing required dependency "${dependencyName}", please check if it is installed (pnpm install ${dependencyName}).`;
}

export function loadAdapter<TAdapter extends object>(adapterName: string): TAdapter {
    try {
        return _require(adapterName) as TAdapter;
    } catch (cause) {
        logger.error(new Error(MISSING_REQUIRED_DEPENDENCY(adapterName), { cause }));
        process.exit(1);
    }
}
