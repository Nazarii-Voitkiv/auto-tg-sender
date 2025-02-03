"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bot = void 0;
const telegraf_1 = require("telegraf");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const config_1 = require("./config");
class Bot {
    constructor() {
        this.messagesPath = path.join(__dirname, '../src/models/messages.json');
        this.groupsPath = path.join(__dirname, '../src/models/groups.json');
        this.chatIds = new Set();
        console.log('Initializing bot with token:', config_1.BOT_TOKEN);
        console.log('WebApp URL:', config_1.WEBAPP_URL);
        if (!config_1.BOT_TOKEN) {
            throw new Error('BOT_TOKEN must be provided!');
        }
        this.bot = new telegraf_1.Telegraf(config_1.BOT_TOKEN);
        this.setupCommands();
        this.setupWebApp();
    }
    setupCommands() {
        this.bot.command('start', (ctx) => {
            const chatId = ctx.message?.chat.id;
            if (chatId) {
                this.chatIds.add(chatId);
            }
            ctx.reply('Вітаю! Використовуйте /send для відправки повідомлень у групи.');
        });
        this.bot.command('send', async (ctx) => {
            try {
                const messages = await this.getMessages();
                const groups = await this.getGroups();
                for (const message of messages) {
                    for (const group of groups) {
                        try {
                            await ctx.telegram.sendMessage(group.text, message.text);
                            console.log(`Message sent to ${group.text}`);
                        }
                        catch (error) {
                            console.error(`Error sending message to ${group.text}:`, error);
                        }
                    }
                }
                ctx.reply('Повідомлення успішно відправлені!');
            }
            catch (error) {
                console.error('Error in /send command:', error);
                ctx.reply('Помилка відправки повідомлень.');
            }
        });
    }
    setupWebApp() {
        this.bot.command('webapp', (ctx) => {
            ctx.reply('Відкрити веб-додаток', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Відкрити', web_app: { url: config_1.WEBAPP_URL } }]
                    ]
                }
            });
        });
    }
    async getMessages() {
        try {
            const data = await fs.readFile(this.messagesPath, 'utf-8');
            return JSON.parse(data);
        }
        catch (error) {
            console.error('Error reading messages:', error);
            return [];
        }
    }
    async getGroups() {
        try {
            const data = await fs.readFile(this.groupsPath, 'utf-8');
            return JSON.parse(data);
        }
        catch (error) {
            console.error('Error reading groups:', error);
            return [];
        }
    }
    launch() {
        this.bot.launch();
        console.log('Bot started');
        process.once('SIGINT', () => this.bot.stop('SIGINT'));
        process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    }
    async sendMessage(chatId, text) {
        try {
            await this.bot.telegram.sendMessage(chatId, text);
        }
        catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }
    async sendMessageToAll(text) {
        console.log('Sending message to all chats:', text);
        for (const chatId of this.chatIds) {
            try {
                await this.sendMessage(chatId, text);
                console.log('Message sent to chat:', chatId);
            }
            catch (error) {
                console.error('Error sending message to chat:', chatId, error);
            }
        }
    }
}
exports.Bot = Bot;
