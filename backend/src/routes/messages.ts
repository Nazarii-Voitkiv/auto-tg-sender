import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { Bot } from '../bot';

const router = express.Router();
const MESSAGES_FILE = path.join(__dirname, '../models/messages.json');
const bot = new Bot();

interface Message {
  id: string;
  text: string;
  created: string;
}

// Читаємо повідомлення з файлу
async function readMessages(): Promise<Message[]> {
  try {
    const data = await fs.readFile(MESSAGES_FILE, 'utf8');
    console.log('Read messages from file:', data);
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading messages:', error);
    return [];
  }
}

// Записуємо повідомлення у файл
async function writeMessages(messages: Message[]): Promise<void> {
  try {
    console.log('Writing messages to file:', messages);
    await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2));
    console.log('Messages written successfully');
  } catch (error) {
    console.error('Error writing messages:', error);
    throw error;
  }
}

// GET /api/messages
router.get('/', async (req, res) => {
  console.log('GET /api/messages');
  try {
    const messages = await readMessages();
    console.log('Sending messages:', messages);
    res.json(messages);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Error getting messages' });
  }
});

// POST /api/messages
router.post('/', async (req, res) => {
  console.log('POST /api/messages', req.body);
  try {
    const { text } = req.body;
    
    if (!text) {
      console.error('No text in request');
      return res.status(400).json({ error: 'Text is required' });
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      created: new Date().toISOString()
    };

    console.log('New message:', newMessage);

    const messages = await readMessages();
    messages.push(newMessage);
    await writeMessages(messages);

    // Відправляємо сповіщення в Telegram
    await bot.sendMessageToAll(`Нове повідомлення:\n${text}`);

    console.log('Message added successfully');
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Error adding message' });
  }
});

// DELETE /api/messages/:id
router.delete('/:id', async (req, res) => {
  console.log('DELETE /api/messages/:id', req.params);
  try {
    const { id } = req.params;
    const messages = await readMessages();
    const filteredMessages = messages.filter(m => m.id !== id);
    
    if (messages.length === filteredMessages.length) {
      console.error('Message not found:', id);
      return res.status(404).json({ error: 'Message not found' });
    }

    await writeMessages(filteredMessages);

    // Відправляємо сповіщення в Telegram
    await bot.sendMessageToAll(`Видалено повідомлення з ID: ${id}`);

    console.log('Message deleted successfully');
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Error deleting message' });
  }
});

export default router;
