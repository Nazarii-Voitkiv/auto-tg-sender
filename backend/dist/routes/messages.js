"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const bot_1 = require("../bot");
const router = express_1.default.Router();
const MESSAGES_FILE = path_1.default.join(__dirname, '../models/messages.json');
const bot = new bot_1.Bot();
// Читаємо повідомлення з файлу
async function readMessages() {
    try {
        const data = await promises_1.default.readFile(MESSAGES_FILE, 'utf8');
        console.log('Read messages from file:', data);
        return JSON.parse(data);
    }
    catch (error) {
        console.error('Error reading messages:', error);
        return [];
    }
}
// Записуємо повідомлення у файл
async function writeMessages(messages) {
    try {
        console.log('Writing messages to file:', messages);
        await promises_1.default.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2));
        console.log('Messages written successfully');
    }
    catch (error) {
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
    }
    catch (error) {
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
        const newMessage = {
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
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: 'Error deleting message' });
    }
});
exports.default = router;
