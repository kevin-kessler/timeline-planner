
import { getModuleName } from '@server/utils.ts';
import { logger } from '@shared/logger';
import cors from 'cors';
import express from 'express';
import { config } from './config.ts';
import routes from './routes.ts';


const log = logger(getModuleName(import.meta.url));

const app = express();

app.use(express.json()); // Parse incoming JSON into req.body
app.use(cors({
    origin: config.allowedOrigins.split(',').map((origin: string) => origin.trim()),
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type'],
}));
app.use('', routes);

app.listen(config.serverPort, () => {
    log.debug(`✅ Board API listening on http://localhost:${config.serverPort}`);
});
