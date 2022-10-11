import { CategoryModuleMetadata } from '../../interfaces';

export function Category(metadata: CategoryModuleMetadata): ClassDecorator {
    return (target: object) => {
        for (const property in metadata) {
            if (Object.prototype.hasOwnProperty.call(metadata, property)) {
                Reflect.defineMetadata(property, metadata[property as keyof typeof metadata], target);
            }
        }
    };
}
