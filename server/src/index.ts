
import { getModuleName } from '@server/utils.ts';
import { logger } from '@shared/logger';
import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.ts';
import routes from './routes.ts';


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
    const clientDistPath = path.resolve(DIR_NAME, '../client/dist');
    app.use(express.static(clientDistPath));

    // Serve index.html on unknown routes (for SPA fallback)
    app.get('*', (_req, res) => {
        res.sendFile(path.join(clientDistPath, 'index.html'));
    });
} else {
    log.debug('🚧 Development mode: client served separately via Vite dev server');
}

// Start server
app.listen(config.serverPort, () => {
    log.debug(`✅ Board API listening on http://localhost:${config.serverPort}`);
});
