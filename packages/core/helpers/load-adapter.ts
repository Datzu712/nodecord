import { Logger } from '@nodecord/core';

function MISSING_REQUIRED_DEPENDENCY(dependencyName: string) {
    return `Missing required dependency "${dependencyName}", please check if it is installed (npm install ${dependencyName}).`;
}
const logger = new Logger('DependencyLoader');

export function loadAdapter(adapterName: string) {
    try {
        // eslint-disable-next-line security/detect-non-literal-require
        return require(adapterName);
    } catch (error) {
        logger.error(MISSING_REQUIRED_DEPENDENCY(adapterName));
        process.exit(1);
    }
}
