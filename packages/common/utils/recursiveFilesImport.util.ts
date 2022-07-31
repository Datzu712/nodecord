import { existsSync, readdirSync, lstatSync } from 'fs';
import { resolve } from 'path';

export interface ImportedFile<T> {
    /**
     * The absolute path of the file.
     */
    path: string;
    /**
     * Contains the content of the file (default or all exports).
     */
    content: T;
    /**
     * Name of the file.
     */
    name: string;
}

/**
 * Import all files (deep import) from a given path.
 * @param { string } dir - Path to the directory to import all files.
 * @returns { Promise<{ path: string; content: object, name: string }[]> }
 */
export async function importAllFilesFrom<T extends object>(dir: string): Promise<ImportedFile<T>[]> {
    const subPaths = readdirSync(dir);
    const files: ImportedFile<T>[] = [];
    // Element may be a folder or a file
    for (const element of subPaths) {
        // Path of the file or directory
        const path = resolve(dir, element);
        // Check if the element is an valid file or a directory
        if (!existsSync(path)) {
            throw new Error(`${path} does not exist`);
        }
        const isDirectory = lstatSync(path).isDirectory();

        // If it's a directory, import all files from it using this function (recursively). Otherwise, push the file content into the array
        if (isDirectory) {
            files.push(...(await importAllFilesFrom<T>(path)));
        } else {
            const content = await import(path);
            files.push({
                content: content?.default ? content?.default : content,
                path,
                name: element,
            });
        }
    }
    return files;
}
