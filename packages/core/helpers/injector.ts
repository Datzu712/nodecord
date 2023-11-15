import { MetadataScanner } from './metadata-scanner';
import type { CategoryMetadata, DefinedCategory, DefinedCommand } from '../interfaces';
import { Scanner } from './scanner';

export class Injector {
    constructor(private module: any) {}

    public loadCategoriesWithCommands(): DefinedCategory[] {
        const mainModuleMetadata = MetadataScanner.getClientModuleMetadata(this.module);
        // Categories with non-instanced commands
        const categoriesMetadata = mainModuleMetadata.categories.map((category) =>
            MetadataScanner.getCategoryMetadata(category),
        );
        const computedCategories = [] as DefinedCategory[];

        for (const categoryMetadata of categoriesMetadata) {
            const commands = this.loadCommands(categoryMetadata);
            const category = { ...categoryMetadata, commands } as DefinedCategory;

            // commands.forEach((command) => (command.metadata.category = category));
            computedCategories.push(category);
        }
        return computedCategories;
    }

    public loadCommands(category: CategoryMetadata): DefinedCommand[] {
        // todo: Import command decorators metadata
        return (
            category.commands?.map((CommandInstance) => {
                const metadata = MetadataScanner.getCommandMetadata(CommandInstance);
                // todo check constructor required arguments
                const command = new CommandInstance();

                const commandName = Scanner.isSlashCommand(CommandInstance) ? `/${metadata.name}` : metadata.name;

                return Object.assign(command, {
                    metadata: Object.assign(metadata, {
                        name: commandName,
                        category,
                    }),
                }) as DefinedCommand;
            }) || []
        );
    }
}
