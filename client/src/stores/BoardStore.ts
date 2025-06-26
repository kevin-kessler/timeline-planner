import { config } from '@client/config';
import { EntityNotFoundError } from '@client/errors/EntityNotFoundError';
import { EntityType } from '@shared/constants';
import { logger } from '@shared/logger';
import {
    type BoardData,
    type BoardInfo,
    type BodyData,
    type FooterData,
    type HeaderData,
    type RowData,
} from '@shared/types';
import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';


const log = logger('BoardStore');

/**
 * Asserts that the given entity exists, otherwise throws an EntityNotFoundError.
 *
 * @param entity - The entity instance to check.
 * @param entityType - The type of the entity.
 * @param entityId - The unique identifier of the entity.
 * @returns The entity if it exists.
 * @throws {EntityNotFoundError} If the entity is undefined.
 */
function assertEntity<T>(entity: T | undefined, entityType: EntityType, entityId: string): T {
    if (!entity) {
        throw new EntityNotFoundError(entityType, entityId);
    }
    return entity;
}

/**
 * Checks if the provided updates would change the original entity if applied.
 *
 * @param original - The original entity.
 * @param updates - The updates to check against the original entity.
 * @returns {boolean} True if the entity has changed, false otherwise.
 */
function doesChangeEntity<T>(original: T, updates: Partial<T>): boolean {
    return Object.entries(updates).some(
        ([key, value]) => original[key as keyof T] !== value,
    );
}

export const useBoardStore = defineStore('board', {
    state: (): {
        boardData: BoardData,
        hasUnsavedChanges: boolean,
    } => ({
        boardData: {
            boardInfo: {
                type: EntityType.BoardInfo,
                id: '',
                name: '',
            },
            type: EntityType.BoardData,
            rows: [],
        },
        hasUnsavedChanges: false,
    }),

    getters: {
        boardHasUnsavedChanges: (state): boolean => {
            const { hasUnsavedChanges } = state;
            return hasUnsavedChanges;
        },
        boardId: (state): string => {
            const { id } = state.boardData.boardInfo;
            return id;
        },
        boardName: (state): string => {
            const { name } = state.boardData.boardInfo;
            return name;
        },
        rows: (state): RowData[] => {
            const { rows } = state.boardData;
            return rows;
        },
        rowById: (state) => (rowId: string): RowData | undefined => {
            const row = state.boardData.rows.find((r) => r.id === rowId);
            return row;
        },
        rowByHeaderId: (state) => (headerId: string): RowData | undefined => {
            const row = state.boardData.rows.find((r) => r.headers.some((h) => h.id === headerId));
            return row;
        },
        rowByBodyId: (state) => (bodyId: string): RowData | undefined => {
            const row = state.boardData.rows.find((r) => r.bodies.some((c) => c.id === bodyId));
            return row;
        },
        rowByFooterId: (state) => (footerId: string): RowData | undefined => {
            const row = state.boardData.rows.find((r) => r.footers.some((f) => f.id === footerId));
            return row;
        },
        bodyById: (state) => (bodyId: string): BodyData | undefined => {
            const body = state.boardData.rows
                .flatMap((r) => r.bodies)
                .find((b) => b.id === bodyId);
            return body;
        },
        headerById: (state) => (headerId: string): HeaderData | undefined => {
            const header = state.boardData.rows
                .flatMap((r) => r.headers)
                .find((h) => h.id === headerId);
            return header;
        },
        footerById: (state) => (footerId: string): FooterData | undefined => {
            const footer = state.boardData.rows
                .flatMap((r) => r.footers)
                .find((f) => f.id === footerId);
            return footer;
        },
    },

    actions: {
        async fetchAvailableBoardInfos() : Promise<BoardInfo[]> {
            log.debug('Fetching available board infos ...');
            const res = await fetch(`${config.apiBaseUrl}/board-infos/`);
            if (!res.ok) throw new Error(await res.text());
            return await res.json() as BoardInfo[];
        },

        async fetch(boardId: string) : Promise<BoardData> {
            log.debug(`Fetching board data for board-id '${boardId}'...`);
            const res = await fetch(`${config.apiBaseUrl}/board-data/${boardId}`);
            if (!res.ok) throw new Error(await res.text());
            return await res.json() as BoardData;
        },

        async updateBoardInfo(boardIdBeforeUpdate: string, newBoardInfo: BoardInfo): Promise<void> {
            const res = await fetch(`${config.apiBaseUrl}/board-info/${boardIdBeforeUpdate}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newBoardInfo),
            });
            if (!res.ok) throw new Error(await res.text());
            log.debug(`Updated board info for board-id '${boardIdBeforeUpdate}' with new info:`, newBoardInfo);
        },

        async save(boardData?: BoardData) : Promise<void> {
            const boardDataToSave = boardData ?? this.boardData;
            const res = await fetch(`${config.apiBaseUrl}/board-data/${boardDataToSave.boardInfo.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(boardDataToSave),
            });
            if (!res.ok) throw new Error(await res.text());

            // Only clear unsaved changes if the saved board data is the current board data
            if (this.hasUnsavedChanges && boardDataToSave === this.boardData) {
                this.hasUnsavedChanges = false;
            }

            log.debug('Saved board data:', boardDataToSave);
        },

        async createBoard(newBoardInfo: BoardInfo): Promise<BoardData> {
            log.debug('Creating new board with info:', newBoardInfo);
            const existingBoards = await this.fetchAvailableBoardInfos();
            if (existingBoards.some((board) => board.id === newBoardInfo.id)) {
                throw new Error(`Board with ID '${newBoardInfo.id}' already exists.`);
            }

            const newBoardData: BoardData = {
                type: EntityType.BoardData,
                boardInfo: {
                    type: EntityType.BoardInfo,
                    id: newBoardInfo.id,
                    name: newBoardInfo.name,
                },
                rows: [],
            };

            await this.save(newBoardData);

            return newBoardData;
        },

        init(boardData: BoardData) {
            if (boardData) {
                this.boardData = boardData;
                this.hasUnsavedChanges = false;
                log.debug('Initialized board data:', this.boardData);
                return;
            }

            log.debug('Initializing default board data...');

            this.boardData = {
                type: EntityType.BoardData,
                boardInfo: {
                    type: EntityType.BoardInfo,
                    id: 'Tools Team Sprint Planner',
                    name: '',
                },
                rows: [],
            };

            const rowOne = this.createRow('2025 Sprints', 12, '2025-');
            const rowTwo = this.createRow('Unassigned Sprints');
            const rowThree = this.createRow('2026 Sprints', 12, '2026-');

            this.createBody(rowOne.id, 'Old Approach');
            this.createBody(rowOne.id, 'Old Approach');
            this.createBody(rowOne.id, 'FGC Test Manager', 'EPIC 1, EPIC 2');
            this.createBody(rowOne.id, 'FGC Test Manager', 'EPIC 3, EPIC 4');
            this.createBody(rowOne.id, 'FGC Commander', 'EPIC A, EPIC B');

            this.updateFooter(rowOne.footers[5].id, { description: 'Vasile: Paternity Leave' });
            this.updateFooter(rowOne.footers[6].id, { description: 'Recruitment' });
            this.updateFooter(rowOne.footers[7].id, { description: 'Vasile leaves' });
            this.updateFooter(rowOne.footers[9].id, { description: 'Newcomer' });
            this.updateFooter(rowOne.footers[10].id, { description: 'Benjamin: Paternity Leave' });
            this.updateFooter(rowOne.footers[11].id, { description: 'Benjamin: Paternity Leave' });

            this.createBody(rowTwo.id, 'Barcode Manager', 'Migrate Vue + Python');
            this.createBody(rowTwo.id, 'Device Status', 'Migrate Vue + Python');
            this.createBody(rowTwo.id, 'FGC Commander', 'Hardening I');
            this.createBody(rowTwo.id, 'FGC Commander', 'Command Sequences, New Features');
            this.createBody(rowTwo.id, 'EPC Admin Dashboard');
            this.createBody(rowTwo.id, 'PowerSpy Refactoring', 'Replace flot and jQuery');
            this.createBody(rowTwo.id, 'PowerSpy Hardening', 'Mainly bugfixes');
            this.createBody(rowTwo.id, 'PowerSpy Features', 'Add new requested features');
            this.createBody(rowTwo.id, 'Device Manager [1]');
            this.createBody(rowTwo.id, 'Device Manager [2]');
            this.createBody(rowTwo.id, 'Device Manager [3]');
            this.createBody(rowTwo.id, 'FGC Configurator [1]');
            this.createBody(rowTwo.id, 'FGC Configurator [2]');
            this.createBody(rowTwo.id, 'FGC Configurator [3]');

            this.createBody(rowThree.id, 'FRESCO v3 [1]');
            this.createBody(rowThree.id, 'FRESCO v3 [2]');
            this.createBody(rowThree.id, 'FRESCO v3 [3]');
        },

        createRow(title: string = 'New Row', numOfCols: number = 0, headerPrefix: string = '') : RowData {
            const row: RowData = {
                type: EntityType.RowData,
                id: uuidv4(),
                title,
                numOfCols,
                headerPrefix,
                headers: [] as HeaderData[],
                bodies: [] as BodyData[],
                footers: [] as FooterData[],
            };
            this.boardData.rows.push(row);

            // Generate column headers and footers based on input
            for (let i = 0; i < numOfCols; i += 1) {
                const headerTitle = `${headerPrefix}${String(i + 1).padStart(2, '0')}`;
                this.createHeader(row.id, headerTitle);
                this.createFooter(row.id);
            }

            this.hasUnsavedChanges = true;
            log.debug(`Created ${row.type}:`, row);
            return row;
        },

        createHeader(rowId: string, title: string = 'New Header Card') : HeaderData {
            const row = assertEntity(this.rowById(rowId), EntityType.RowData, rowId);
            const header: HeaderData = {
                type: EntityType.HeaderData,
                id: uuidv4(),
                title,
            };
            row.headers.push(header);
            this.hasUnsavedChanges = true;
            log.debug(`Created ${header.type}:`, header);
            return header;
        },

        createBody(rowId: string, title: string = 'New Body Card', description: string = '', note: string = '') : BodyData {
            const row = assertEntity(this.rowById(rowId), EntityType.RowData, rowId);
            const body: BodyData = {
                type: EntityType.BodyData,
                id: uuidv4(),
                title,
                description,
                note,
            };
            row.bodies.push(body);
            this.hasUnsavedChanges = true;
            log.debug(`Created ${body.type}:`, body);
            return body;
        },

        createFooter(rowId: string, description: string = '') : FooterData {
            const row = assertEntity(this.rowById(rowId), EntityType.RowData, rowId);
            const footer: FooterData = {
                type: EntityType.FooterData,
                id: uuidv4(),
                description,
            };
            row.footers.push(footer);
            this.hasUnsavedChanges = true;
            log.debug(`Created ${footer.type}:`, footer);
            return footer;
        },

        updateRow(rowId: string, updates: Partial<RowData>) {
            const row = assertEntity(this.rowById(rowId), EntityType.RowData, rowId);
            if (!doesChangeEntity(row, updates)) {
                return;
            }

            const oldRow = { ...row };
            Object.assign(row, updates);
            this.hasUnsavedChanges = true;
            log.debug(`Updated ${row.type}:`, row);

            // Replace old header prefix
            for (const header of row.headers) {
                header.title = header.title.replace(oldRow.headerPrefix, row.headerPrefix);
            }

            // Adjust the number of headers based on the new number of columns
            if (row.numOfCols > oldRow.headers.length) {
                for (let i = row.headers.length; i < row.numOfCols; i += 1) {
                    this.createHeader(row.id, `${row.headerPrefix}${String(i + 1).padStart(2, '0')}`);
                }
            } else if (row.numOfCols < oldRow.headers.length) {
                row.headers.splice(row.numOfCols);
            }

            // Adjust the number of footers based on the new number of columns
            if (row.numOfCols > oldRow.footers.length) {
                for (let i = row.footers.length; i < row.numOfCols; i += 1) {
                    this.createFooter(row.id);
                }
            } else if (row.numOfCols < oldRow.footers.length) {
                row.footers.splice(row.numOfCols);
            }
        },

        updateHeader(headerId: string, updates: Partial<HeaderData>) {
            const header = assertEntity(this.headerById(headerId), EntityType.HeaderData, headerId);
            if (!doesChangeEntity(header, updates)) return;

            Object.assign(header, updates);
            this.hasUnsavedChanges = true;
            log.debug(`Updated ${header.type}:`, header);
        },

        updateBody(bodyId: string, updates: Partial<BodyData>) {
            const body = assertEntity(this.bodyById(bodyId), EntityType.BodyData, bodyId);
            if (!doesChangeEntity(body, updates)) return;

            Object.assign(body, updates);
            this.hasUnsavedChanges = true;
            log.debug(`Updated ${body.type}:`, body);
        },

        updateFooter(footerId: string, updates: Partial<FooterData>) {
            const footer = assertEntity(this.footerById(footerId), EntityType.FooterData, footerId);
            if (!doesChangeEntity(footer, updates)) return;

            Object.assign(footer, updates);
            this.hasUnsavedChanges = true;
            log.debug(`Updated ${footer.type}:`, footer);
        },

        deleteRow(rowId: string) {
            const row = assertEntity(this.rowById(rowId), EntityType.RowData, rowId);
            this.boardData.rows = this.boardData.rows.filter((r) => r.id !== row.id);
            this.hasUnsavedChanges = true;
            log.debug(`Deleted ${row.type}:`, row);
        },

        deleteHeader(headerId: string) {
            const row = assertEntity(this.rowByHeaderId(headerId), EntityType.HeaderData, headerId);
            row.headers = row.headers.filter((h) => h.id !== headerId);
            this.hasUnsavedChanges = true;
            log.debug(`Deleted ${EntityType.HeaderData}: ${headerId}`);
        },

        deleteBody(bodyId: string) {
            const row = assertEntity(this.rowByBodyId(bodyId), EntityType.BodyData, bodyId);
            row.bodies = row.bodies.filter((b) => b.id !== bodyId);
            this.hasUnsavedChanges = true;
            log.debug(`Deleted ${EntityType.BodyData}: ${bodyId}`);
        },

        deleteFooter(footerId: string) {
            const row = assertEntity(this.rowByFooterId(footerId), EntityType.FooterData, footerId);
            row.footers = row.footers.filter((f) => f.id !== footerId);
            this.hasUnsavedChanges = true;
            log.debug(`Deleted ${EntityType.FooterData}: ${footerId}`);
        },
    },
});
