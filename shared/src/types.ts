import { z } from 'zod';
import {
    BoardDataSchema,
    BoardInfoSchema,
    BodyDataSchema,
    FooterDataSchema,
    HeaderDataSchema,
    RowDataSchema,
} from './schemas';


export type HeaderData = z.infer<typeof HeaderDataSchema>;
export type FooterData = z.infer<typeof FooterDataSchema>;
export type BodyData = z.infer<typeof BodyDataSchema>;
export type RowData = z.infer<typeof RowDataSchema>;
export type BoardInfo = z.infer<typeof BoardInfoSchema>;
export type BoardData = z.infer<typeof BoardDataSchema>;
