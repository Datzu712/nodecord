import { MetadataScanner } from '../client/metadata-scanner';
import type { CategoryMetadata, DefinedCategory, DefinedCommand } from '../interfaces';

export class Injector {
    constructor(private module: any) {}

    public loadCategoriesWithCommands(): DefinedCategory[] {
        const mainModuleMetadata = MetadataScanner.getClientModuleMetadata(this.module);
        // Categories with non-instanced commands
        const categoriesMetadata = mainModuleMetadata.categories.map((category) =>
            MetadataScanner.getCategoryMetadata(category),
        );
        const computedCategories = [] as DefinedCategory[];

        for (const category of categoriesMetadata) {
            const commands = this.loadCommands(category);

            commands.forEach((command) => (command.metadata.category = category));
            computedCategories.push({ ...category, commands });
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

                return Object.assign(command, metadata) as DefinedCommand;
            }) || []
        );
    }
}
