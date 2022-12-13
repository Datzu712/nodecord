import { Logger, DefinedCommand } from '@nodecord/core';

export class CommandManager extends Map<string, DefinedCommand> {
    private logger = new Logger('CommandManager');

    /**
     * Get command by name.
     * @param { string } name - Command name.
     * @param { boolean } sloppy - True for return the first command that matches with the name (included aliases).
     * @returns { ICommand | null } Command found (or undefined).
     */
    public get(name: string, sloppy?: boolean): DefinedCommand | undefined {
        let command = super.get(name);

        if (!command) {
            for (const [cmdName, cmd] of this) {
                if (
                    cmd.metadata.aliases.some((alias) => alias === name || (sloppy && alias.includes(name))) ||
                    (sloppy && cmdName.includes(name))
                ) {
                    command = cmd;
                    break;
                }
            }
        }
        return command;
    }
}
