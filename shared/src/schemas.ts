

/**
 * Zod schema for serverside validation of BoardData.
 * Also used to generate TypeScript types for the client.
 */
import { z } from 'zod';
import { EntityType } from './constants';


export const HeaderDataSchema = z.object({
    type: z.literal(EntityType.HeaderData),
    id: z.string(),
    title: z.string(),
});

export const FooterDataSchema = z.object({
    type: z.literal(EntityType.FooterData),
    id: z.string(),
    description: z.string(),
});

export const BodyDataSchema = z.object({
    type: z.literal(EntityType.BodyData),
    id: z.string(),
    title: z.string(),
    description: z.string(),
    note: z.string().optional(),
});

export const RowDataSchema = z.object({
    type: z.literal(EntityType.RowData),
    id: z.string(),
    title: z.string(),
    numOfCols: z.number(),
    headerPrefix: z.string(),
    headers: z.array(HeaderDataSchema),
    bodies: z.array(BodyDataSchema),
    footers: z.array(FooterDataSchema),
});

export const BoardInfoSchema = z.object({
    type: z.literal(EntityType.BoardInfo),
    id: z.string(),
    name: z.string(),
});

export const BoardDataSchema = z.object({
    type: z.literal(EntityType.BoardData),
    boardInfo: BoardInfoSchema,
    rows: z.array(RowDataSchema),
});
