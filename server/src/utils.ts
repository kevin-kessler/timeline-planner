import path from 'path';
import { fileURLToPath } from 'url';


/**
 * Extracts the module name from a given module URL by converting it to a file path,
 * retrieving the base filename, and removing its file extension.
 *
 * E.g. for a module URL like `file:///path/to/module.js`, it returns `module`.
 *
 * @param moduleUrl - The URL of the module to extract the name from.
 * @returns The module name without its file extension.
 */
export function getModuleName(moduleUrl: string): string {
    const filePath = fileURLToPath(moduleUrl);
    const filename = path.basename(filePath);
    return filename.replace(/\.[^/.]+$/, ''); // Remove file extension
}
