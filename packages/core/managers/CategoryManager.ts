import type { DefinedCategory } from '../interfaces/category/defined-category.interface';
import { Logger } from '../services/logger.service';

export class CategoryManager extends Map<string, DefinedCategory> {
    private logger = new Logger('CategoryManager');

    /**
     * Get category by name.
     * @param { string } name - Category name.
     * @param { boolean } sloppy - True for return the first category that matches with the name).
     * @returns { CategoryMetadata | null } Category found (or undefined).
     */
    public get(name: string, sloppy?: boolean): DefinedCategory | undefined {
        let category = super.get(name);

        if (!category && sloppy) {
            for (const [categoryName, data] of this) {
                if (categoryName.includes(name)) {
                    category = data;
                    break;
                }
            }
        }
        return category;
    }
}
