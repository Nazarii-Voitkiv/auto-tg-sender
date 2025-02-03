import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const WEBAPP_URL = process.env.WEBAPP_URL || '';

export class Bot {
  private bot: TelegramBot;
  private chatIds: Set<number> = new Set();
  private static instance: Bot;

  private constructor() {
    console.log('Initializing bot with token:', BOT_TOKEN);
    console.log('WebApp URL:', WEBAPP_URL);
    
    this.bot = new TelegramBot(BOT_TOKEN, { 
      polling: true,
      filepath: false
    });
    this.setupCommands();
  }

  public static getInstance(): Bot {
    if (!Bot.instance) {
      Bot.instance = new Bot();
    }
    return Bot.instance;
  }

  async sendMessageToAll(text: string): Promise<void> {
    console.log('Sending message to all chats:', text);
    for (const chatId of this.chatIds) {
      try {
        await this.bot.sendMessage(chatId, text);
        console.log('Message sent to chat:', chatId);
      } catch (error) {
        console.error('Error sending message to chat:', chatId, error);
      }
    }
  }

  private setupCommands(): void {
    // Команда /start
    this.bot.onText(/\/start/, async (msg) => {
      console.log('Received /start command from:', msg.from?.username);
      const chatId = msg.chat.id;
      
      // Зберігаємо chatId
      this.chatIds.add(chatId);
      console.log('Added chat ID:', chatId);
      console.log('Current chat IDs:', Array.from(this.chatIds));

      await this.bot.sendMessage(chatId, 'Привіт! Я допоможу тобі керувати повідомленнями.', {
        reply_markup: {
          keyboard: [[{
            text: 'Відкрити веб-додаток',
            web_app: { url: WEBAPP_URL }
          }]],
          resize_keyboard: true
        }
      });
    });

    // Логуємо всі помилки
    this.bot.on('polling_error', (error) => {
      console.error('Polling error:', error);
    });

    this.bot.on('error', (error) => {
      console.error('Bot error:', error);
    });

    // Логуємо всі вхідні повідомлення
    this.bot.on('message', (msg) => {
      console.log('Received message:', JSON.stringify(msg, null, 2));
    });
  }
}