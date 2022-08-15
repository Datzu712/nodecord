import { CategoryModuleMetadata } from '../../interfaces';

export function CategoryModule(metadata: CategoryModuleMetadata) {
    return (target: new () => any) => {
        for (const property in metadata) {
            if (Object.prototype.hasOwnProperty.call(metadata, property)) {
                Reflect.defineMetadata(property, metadata[property as keyof typeof metadata], target);
            }
        }
    };
}
