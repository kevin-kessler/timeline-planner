import { getModuleName } from '@server/utils';
import { logger } from '@shared/logger';
import { BoardDataSchema, BoardInfoSchema } from '@shared/schemas';
import type { BoardData, BoardInfo } from '@shared/types';
import { format } from 'date-fns';
import fs, { readdir } from 'fs/promises';
import path from 'path';
import { config } from './config';


const log = logger(getModuleName(import.meta.url));


/**
 * Asserts that the provided `boardId` is a valid identifier consisting only of
 * alphanumeric characters, underscores, or hyphens. Throws an error if the validation fails.
 * Used to prevent path traversal attacks / ensure that the `boardId` is safe to use in file paths.
 * @param boardId - The board ID to validate.
 * @returns The validated board ID if it passes the check.
 * @throws {Error} If the `boardId` contains invalid characters.
 */
export const assertBoardId = (boardId: string): string => {
    if (!/^[a-zA-Z0-9_-]+$/.test(boardId)) {
        throw new Error(`Invalid board ID: '${boardId}'`);
    }
    return boardId;
};

/**
 * Validates and returns board data, or throws error if invalid.
 *
 * @param boardData - The raw input to validate.
 * @returns The validated BoardData object.
 * @throws ZodError if the data is invalid.
 * @throws Error if the board info is invalid.
 */
export const assertBoardData = (boardData: unknown): BoardData => {
    const validatedBoardData = BoardDataSchema.parse(boardData);
    assertBoardId(validatedBoardData.boardInfo.id);
    log.debug(`Successfully validated board data for board-id '${validatedBoardData.boardInfo.id}'`);
    return validatedBoardData;
};

/**
 * Validates and returns board info, or throws error if invalid.
 *
 * @param boardInfo - The raw input to validate.
 * @returns The validated BoardInfo object.
 * @throws ZodError if the data is invalid.
 * @throws Error if the board ID is invalid.
 */
export const assertBoardInfo = (boardInfo: unknown): BoardInfo => {
    const validatedBoardInfo = BoardInfoSchema.parse(boardInfo);
    assertBoardId(validatedBoardInfo.id);
    log.debug(`Successfully validated board info for board-id '${validatedBoardInfo.id}'`);
    return validatedBoardInfo;
};

/**
 * Resolves the absolute directory path for the history (backups) of a given board ID.
 *
 * @param boardId - The unique identifier of the board.
 * @returns The absolute path to the history directory for the board.
 */
export const resolveHistoryDirPath = (boardId: string): string => {
    const p = path.resolve(config.boardDataPath, boardId, 'backups');
    return p;
};

/**
 * Resolves the absolute file path to a history file for a given board ID and timestamp.
 *
 * @param boardId - The unique identifier of the board.
 * @param timestamp - The timestamp to include in the filename.
 * @returns The absolute path to the corresponding history file.
 */
export const resolveHistoryFilePath = (boardId: string, timestamp: string) : string => {
    const p = path.resolve(resolveHistoryDirPath(boardId), `board-${timestamp}.json`);
    return p;
};

/**
 * Resolves the absolute directory path for the board data directory of a given board ID.
 *
 * @param boardId - The unique identifier of the board.
 * @returns The absolute path to the board's data directory.
 */
export const resolveBoardDirPath = (boardId: string): string => {
    const p = path.resolve(config.boardDataPath, boardId);
    return p;
};

/**
 * Resolves the absolute file path to the `board.json` file for a given board ID.
 *
 * @param boardId - The unique identifier of the board.
 * @returns The absolute path to the corresponding `board.json`.
 */
export const resolveBoardFilePath = (boardId: string): string => {
    const p = path.resolve(resolveBoardDirPath(boardId), 'board.json');
    return p;
};

export const boardFileExists = async (boardId: string): Promise<boolean> => {
    const filePath = resolveBoardFilePath(boardId);
    try {
        await fs.access(filePath);
        return true;
    } catch (err) {
        const error = err as NodeJS.ErrnoException;
        if (error.code === 'ENOENT') {
            return false; // File does not exist
        }
        throw new Error(`Failed to check existence of board file '${filePath}': ${error.message}`);
    }
};

export const readBoardFile = async (boardId: string): Promise<BoardData> => {
    const filePath = resolveBoardFilePath(boardId);
    log.debug(`Reading board data for board-id '${boardId}' from '${filePath}'`);
    const boardDataStr = await fs.readFile(filePath, 'utf-8');
    const boardDataJson = JSON.parse(boardDataStr);
    return assertBoardData(boardDataJson);
};

export const readHistoryFile = async (boardId: string, timestamp: string): Promise<BoardData> => {
    const filePath = resolveHistoryFilePath(boardId, timestamp);
    log.debug(`Reading history data for board-id '${boardId}' from '${filePath}'`);
    const historyDataStr = await fs.readFile(filePath, 'utf-8');
    const historyDataJson = JSON.parse(historyDataStr);
    return assertBoardData(historyDataJson);
};

/**
 * Writes the given board data to disk.
 *
 * @param boardId - The unique identifier of the board.
 * @param data - The board data object to write.
 */
export const writeBoardFile = async (boardId: string, boardData: BoardData): Promise<void> => {
    const filePath = resolveBoardFilePath(boardId);
    log.debug(`Writing board data for board-id '${boardId}' from '${filePath}'`);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(boardData, null, 2), 'utf-8');
};

/**
 * Create a timestamped history file (backup) of the given board file (if it exists).
 *
 * @param boardId - The unique identifier of the board to be added to the history.
 */
export const writeBoardHistoryFile = async (boardId: string): Promise<void> => {
    const timestamp = format(new Date(), "yyyy-MM-dd'T'HH-mm-ss");
    const srcFilePath = resolveBoardFilePath(boardId);
    const historyFilePath = resolveHistoryFilePath(boardId, timestamp);

    try {
        const srcFile = await fs.readFile(srcFilePath, 'utf-8');
        await fs.mkdir(path.dirname(historyFilePath), { recursive: true });
        await fs.writeFile(historyFilePath, srcFile, 'utf-8');

        log.debug(`Created history for board '${boardId}' at '${path.basename(historyFilePath)}'`);
    } catch (err) {
        const error = err as NodeJS.ErrnoException;
        if (error.code === 'ENOENT') {
            log.debug(`Did not write history - Board file does not exist for board '${boardId}' ('${srcFilePath}')`);
        } else {
            throw new Error(`Failed to write history for board '${boardId}' at '${srcFilePath}': ${error.message}`);
        }
    }
};

export const moveBoardDir = async (oldBoardId: string, newBoardId: string): Promise<void> => {
    if (await boardFileExists(newBoardId)) {
        throw new Error(`Cannot move board data directory - Target board id '${newBoardId}' is already in use.`);
    }

    // Move board-data files to new ID location
    const oldDataDirPath = resolveBoardDirPath(oldBoardId);
    const newDataDirPath = resolveBoardDirPath(newBoardId);
    try {
        await fs.rename(oldDataDirPath, newDataDirPath);
        log.debug(`Moved board data directory from '${oldDataDirPath}' to '${newDataDirPath}'`);
    } catch (err) {
        throw new Error(`Failed to move board data directory from '${oldDataDirPath}' to '${newDataDirPath}': ${(err as Error).message}`);
    }
    // TODO: Perhaps update board ID in the board data for each history file
};

export const listAvailableBoardInfos = async (): Promise<BoardInfo[]> => {
    await fs.mkdir(path.dirname(resolveBoardFilePath('')), { recursive: true });
    const boardDirs = await readdir(config.boardDataPath, { withFileTypes: true });

    const boardInfos = await Promise.all(
        boardDirs
            .filter((boardDir) => boardDir.isDirectory())
            .map(async (boardDir) => {
                const boardId = boardDir.name;
                const boardFile = path.join(config.boardDataPath, boardId, 'board.json');

                try {
                    const fileContent = await fs.readFile(boardFile, 'utf-8');
                    const fileContentJson = JSON.parse(fileContent);
                    const validatedBoard = assertBoardData(fileContentJson);
                    return validatedBoard.boardInfo;
                } catch (err) {
                    log.warn(`Skipping invalid board data of '${boardId}': ${(err as Error).message}`);
                    return null;
                }
            }),
    );

    const availableBoardInfos = boardInfos.filter((info): info is BoardInfo => info !== null);
    return availableBoardInfos.sort((a, b) => a.name.localeCompare(b.name));
};
