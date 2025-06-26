
import { getModuleName } from '@server/utils';
import { logger } from '@shared/logger';
import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config';
import routes from './routes';


const log = logger(getModuleName(import.meta.url));
const app = express();

const FILE_NAME = fileURLToPath(import.meta.url);
const DIR_NAME = path.dirname(FILE_NAME);

// Middleware
app.use(express.json()); // Parse incoming JSON into req.body
app.use(cors({
    origin: config.allowedOrigins.split(',').map((origin: string) => origin.trim()),
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type'],
}));

// API Routes
app.use('', routes);

// Serve static client files in production
if (config.serverEnv === 'production') {
    const clientDistPath = path.resolve(DIR_NAME, '../../../client');
    app.use(express.static(clientDistPath));

    // Serve index.html on unknown routes (for SPA fallback)
    // app.get('*', (_req, res) => {
    //     res.sendFile(path.join(clientDistPath, 'index.html'));
    // });
} else {
    log.debug('🚧 Development mode: client served separately via Vite dev server');
}

// Start server
app.listen(Number(config.serverPort), '0.0.0.0', () => {
    log.debug(`✅ Board API listening on http://0.0.0.0:${config.serverPort}`);
});
