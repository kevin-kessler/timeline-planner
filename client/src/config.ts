export const config = {
    serverEnv: import.meta.env.VITE_SERVER_ENV,
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
};

if (!config.serverEnv) {
    throw new Error('Missing VITE_SERVER_ENV in .env');
}

if (!config.apiBaseUrl) {
    throw new Error('Missing VITE_API_BASE_URL in .env');
}

