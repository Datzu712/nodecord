import { CategoryMetadata } from '../../interfaces';

export function Category(metadata: CategoryMetadata): ClassDecorator {
    return (target: object) => {
        for (const property in metadata) {
            if (Object.prototype.hasOwnProperty.call(metadata, property)) {
                Reflect.defineMetadata(property, metadata[property as keyof typeof metadata], target);
            }
        }
    };
}
