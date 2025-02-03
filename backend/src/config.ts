import dotenv from 'dotenv';

dotenv.config();

export const BOT_TOKEN = process.env.BOT_TOKEN || '';
export const WEBAPP_URL = process.env.WEBAPP_URL || '';
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';
export const FRONTEND_PROD_URL = process.env.FRONTEND_PROD_URL || '';
