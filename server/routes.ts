
import { getModuleName } from '@server/utils.ts';
import { logger } from '@shared/logger.ts';
import { Router } from 'express';
import fs from 'fs/promises';
import {
    assertBoardData,
    assertBoardId,
    assertBoardInfo,
    listAvailableBoardInfos,
    moveBoardDir,
    readBoardFile,
    resolveHistoryDirPath,
    writeBoardFile,
    writeBoardHistoryFile,
} from './boardIO.ts';


const log = logger(getModuleName(import.meta.url));
const router = Router();

router.get('/board-data/:boardId', async (req, res) => {
    const boardId = assertBoardId(req.params.boardId);
    try {
        res.json(await readBoardFile(boardId));
    } catch (err) {
        const msg = `Failed to read board with board-id '${boardId}'`;
        log.error(`${msg}:`, err);
        res.status(404).json({ error: msg });
    }
});

router.post('/board-data/:boardId', async (req, res) => {
    const boardId = assertBoardId(req.params.boardId);
    try {
        const boardData = assertBoardData(req.body);
        await writeBoardHistoryFile(boardId);
        await writeBoardFile(boardId, boardData);
        res.status(200).json({ status: 'ok' });
    } catch (err) {
        const msg = `Failed to save board with board-id '${boardId}'`;
        log.error(`${msg}:`, err);
        res.status(500).json({ error: msg });
    }
});

router.patch('/board-info/:boardId', async (req, res) => {
    const oldBoardId = assertBoardId(req.params.boardId);

    try {
        const newBoardInfo = assertBoardInfo(req.body);
        const boardData = await readBoardFile(oldBoardId);

        const idChanged = boardData.boardInfo.id !== newBoardInfo.id;
        const nameChanged = boardData.boardInfo.name !== newBoardInfo.name;

        if (!idChanged && !nameChanged) {
            return res.status(200).json({ status: 'no changes' });
        }

        // Create backup of current board data
        await writeBoardHistoryFile(boardData.boardInfo.id);

        // If the board ID has changed, move the board directory to the new ID directory
        if (idChanged) {
            await moveBoardDir(oldBoardId, newBoardInfo.id);
        }

        // Update board data
        boardData.boardInfo = newBoardInfo;
        await writeBoardFile(newBoardInfo.id, boardData);

        log.debug(`Updated board info for board-id '${newBoardInfo.id}'`);

        res.status(200).json({ status: 'ok' });
    } catch (err) {
        const msg = `Failed to update board info for board-id '${oldBoardId}'`;
        log.error(`${msg}:`, err);
        res.status(500).json({ error: msg });
    }
});

router.get('/board-data/:boardId/history', async (req, res) => {
    const boardId = assertBoardId(req.params.boardId);
    const backupDir = resolveHistoryDirPath(boardId);
    try {
        const files = await fs.readdir(backupDir);
        res.json(files.sort().reverse()); // latest first
    } catch (err) {
        const msg = `Failed to read history for board-id '${boardId}'`;
        log.error(`${msg}:`, err);
        res.status(404).json({ error: msg });
    }
});

router.get('/board-infos', async (_req, res) => {
    try {
        const boardNames = await listAvailableBoardInfos();
        res.json(boardNames);
    } catch (err) {
        const msg = 'Failed to retrieve list of available board infos';
        log.error(`${msg}:`, err);
        res.status(500).json({ error: msg });
    }
});

export default router;
