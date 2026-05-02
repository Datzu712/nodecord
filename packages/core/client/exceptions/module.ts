import { NodecordExceptionCode } from '../../enums/exceptions.js';
import { Constructor } from '../../interfaces/index.js';
import { NodecordCoreException } from './base.js';

export class InvalidModuleException extends NodecordCoreException {
    constructor(moduleName: string) {
        super(
            `Class ${moduleName} is not a valid module. Make sure it is decorated with @Module.`,
            NodecordExceptionCode.INVALID_MODULE,
        );
    }
}

export class InvalidProviderException extends NodecordCoreException {
    constructor(providerName: string) {
        super(
            `Class ${providerName} is not a valid provider. Make sure it is decorated with @Injectable.`,
            NodecordExceptionCode.INVALID_PROVIDER,
        );
    }
}

export class InvalidListenerException extends NodecordCoreException {
    constructor(listenerName: string) {
        super(
            `Class ${listenerName} is not a valid event listener. Make sure it is decorated with an event decorator (e.g. @Listener).`,
            NodecordExceptionCode.INVALID_LISTENER,
        );
    }
}

export class InvalidHandlerException extends NodecordCoreException {
    constructor(handlerName: string) {
        super(
            `Class ${handlerName} is not a valid command handler. Make sure it is decorated with a command decorator (e.g. @SlashCommand).`,
            NodecordExceptionCode.INVALID_HANDLER,
        );
    }
}

export class InvalidInterceptorException extends NodecordCoreException {
    constructor(interceptorName: string) {
        super(
            [
                `Class ${interceptorName} is not a valid interceptor.`,
                `Make sure it is decorated with @Interceptor and that you are passing the class reference (not an instance) to @UseInterceptors.`,
            ].join('\n'),
            NodecordExceptionCode.INVALID_INTERCEPTOR,
        );
    }
}

export class ProviderNotFoundException extends NodecordCoreException {
    constructor(providerName: string) {
        super(
            [
                `${providerName} is not registered in any module.`,
                `Make sure it is listed in the providers array of its module.`,
            ].join('\n'),
            NodecordExceptionCode.PROVIDER_NOT_FOUND,
        );
    }
}

export class DuplicateInterceptorException extends NodecordCoreException {
    constructor(interceptorName: string, handlerName: string) {
        super(
            [
                `Duplicate interceptor "${interceptorName}" detected for handler ${handlerName}.`,
                `Make sure each interceptor has a unique ID and that you are not registering the same interceptor both globally and at the handler level.`,
            ].join('\n'),
            NodecordExceptionCode.DUPLICATE_INTERCEPTOR,
        );
    }
}

export class MissingContractMethodException extends NodecordCoreException {
    constructor(className: string, contractName: string, method: string) {
        super(
            `Class ${className} does not implement ${contractName}. Make sure it has a "${method}" method.`,
            NodecordExceptionCode.MISSING_CONTRACT_METHOD,
        );
    }
}

export class UnresolvedBindingException extends NodecordCoreException {
    constructor(moduleName: string, dependencyName: string) {
        super(
            [
                `Failed to resolve dependency "${dependencyName}" for module ${moduleName}.`,
                `This usually means that ${dependencyName} is not registered in any module.`,
                `Check that ${dependencyName} is listed in the providers array of the module ${moduleName} or one of its ancestors.`,
            ].join('\n'),
            NodecordExceptionCode.PROVIDER_NOT_FOUND,
        );
    }
}

export class InternalCompilerException extends NodecordCoreException {
    constructor(providerName: string) {
        super(
            [
                `Internal error: ${providerName} is mapped to a module that was not compiled.`,
                `This is likely a bug in ModuleCompiler.`,
            ].join('\n'),
            NodecordExceptionCode.INTERNAL_ERROR,
        );
    }
}

const MAX_ITEMS = 5;

export class PossibleCircularImportException extends NodecordCoreException {
    constructor(
        parentModuleName: string,
        importIndex: number,
        imports: Constructor[],
        providers: Constructor[],
        handlers: Constructor[],
    ) {
        const formattedImports = imports
            .map((imp, idx) =>
                idx === importIndex
                    ? `        --> ${imp?.name ?? 'undefined'} <--`
                    : `        ${imp?.name ?? 'undefined'}`,
            )
            .join(',\n');

        const moduleLines: string[] = [`@Module({`, `    imports: [`, formattedImports, `    ],`];

        if (providers.length > 0) {
            moduleLines.push(`    providers: [${PossibleCircularImportException.formatList(providers)}],`);
        }

        if (handlers.length > 0) {
            moduleLines.push(`    handlers: [${PossibleCircularImportException.formatList(handlers)}],`);
        }

        moduleLines.push(`})`);
        moduleLines.push(`class ${parentModuleName} {}`);

        super(
            [
                `[${parentModuleName}] Failed to resolve imported module.`,
                '',
                `One of the imports inside @Module() resolved to undefined.`,
                '',
                `This commonly happens in CommonJS when two modules import each other,`,
                `creating a circular dependency.`,
                '',
                `Affected module:`,
                '',
                ...moduleLines,
                '',
                `Failed import index: [${importIndex}]`,
                '',
                `Check the dependency graph for circular imports.`,
            ].join('\n'),
            NodecordExceptionCode.CIRCULAR_IMPORT,
        );
    }

    private static formatList(items: Constructor[]): string {
        const visible = items.slice(0, MAX_ITEMS).map((c) => c.name);
        const remaining = items.length - MAX_ITEMS;

        if (remaining > 0) {
            return `${visible.join(', ')}, ...${remaining} more`;
        }

        return visible.join(', ');
    }
}
