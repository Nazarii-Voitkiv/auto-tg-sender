import express from 'express';
import cors from 'cors';
import messagesRouter from './routes/messages';
import groupsRouter from './routes/groups';
import envRouter from './routes/env';
import { Bot } from './bot';
import { FRONTEND_URL, FRONTEND_PROD_URL } from './config';

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    FRONTEND_URL,
    FRONTEND_PROD_URL
  ].filter(Boolean), // Видаляємо порожні значення
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.method === 'POST') {
    console.log('Request body:', req.body);
  }
  next();
});

// Routes
app.use('/api/messages', messagesRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/env', envRouter);

const PORT = process.env.PORT || 3000;

// Initialize bot
const bot = new Bot();
bot.launch();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
