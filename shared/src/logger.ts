/**
 * Creates a logger instance scoped to a specific module.
 *
 * The returned logger provides `debug`, `error`, and `warn` methods.
 * Each method prepends the module name to each log message.
 *
 * @param module - The module name to associate with logs.
 * @returns An object with `debug`, `error`, and `warn` logging methods.
 */
export function logger(module: string): {
    debug: (msg: string, ...args: unknown[]) => void;
    error: (msg: string, ...args: unknown[]) => void;
    warn: (msg: string, ...args: unknown[]) => void;
} {
    return {
        debug: (msg: string, ...args: unknown[]) => console.debug(`[${module}] ${msg}`, ...args),
        error: (msg: string, ...args: unknown[]) => console.error(`[${module}] ${msg}`, ...args),
        warn: (msg: string, ...args: unknown[]) => console.warn(`[${module}] ${msg}`, ...args),
    };
}
