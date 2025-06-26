import dotenv from 'dotenv';


// Load .env file into process.env
dotenv.config();

export const config = {
    allowedOrigins: process.env.ALLOWED_ORIGINS || 'http://localhost:5173',
    boardDataPath: process.env.BOARD_DATA_PATH || './board-data',
    serverEnv: process.env.SERVER_ENV || 'development',
    serverPort: process.env.SERVER_PORT || 8080,
};
