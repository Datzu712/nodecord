import type { ClientModuleMetadata } from '../../interfaces';

export function ClientModule(metadata: ClientModuleMetadata) {
    return (target: new () => any) => {
        for (const property in metadata.categories) {
            if (Object.prototype.hasOwnProperty.call(metadata, property)) {
                Reflect.defineMetadata(property, metadata[property as keyof typeof metadata], target);
            }
        }
    };
}
