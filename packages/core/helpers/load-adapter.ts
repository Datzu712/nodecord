import { Logger } from '../services/logger.service';

function MISSING_REQUIRED_DEPENDENCY(dependencyName: string) {
    return `Missing required dependency "${dependencyName}", please check if it is installed (npm install ${dependencyName}).`;
}
const logger = new Logger('DependencyLoader');

export function loadAdapter<TAdapter extends object>(adapterName: string): TAdapter {
    try {
        // eslint-disable-next-line security/detect-non-literal-require
        return require(adapterName);
    } catch (error) {
        logger.error(MISSING_REQUIRED_DEPENDENCY(adapterName));
        process.exit(1);
    }
}
