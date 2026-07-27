import { ExecutionKind } from '../../../../constants/execution-kind.js';
import { BaseExecuteOptions } from '../../../../interfaces/handler/execute-options.js';
import { SlashCommandExecuteOptions } from '../../../../interfaces/handler/executions/slash-command.js';
import type { Constructor } from '../../../../interfaces/index.js';
import { MetadataScanner } from '../../../container/metadata-scanner.js';

export function compileSlashCommandExecutor({
    baseOptions,
    target,
}: {
    baseOptions: Omit<BaseExecuteOptions, 'kind'>;
    target: Constructor;
}): SlashCommandExecuteOptions {
    return {
        ...baseOptions,
        kind: ExecutionKind.SLASH_COMMAND,
        defer: MetadataScanner.isExecutorDeferReply(target, 'execute'),
        ephemeral: MetadataScanner.isExecutorEphemeral(target, 'execute'), // not implemented yet btw
    };
}
