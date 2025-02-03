import express from 'express';
import cors from 'cors';
import messagesRouter from './routes/messages';
import groupsRouter from './routes/groups';
import { Bot } from './bot';

const app = express();

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
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

const PORT = process.env.PORT || 3000;

// Initialize bot using singleton pattern
Bot.getInstance();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
