import { Telegraf, Context } from 'telegraf';
import { Message } from './interfaces/message.interface';
import { Group } from './interfaces/group.interface';
import * as fs from 'fs/promises';
import * as path from 'path';
import { BOT_TOKEN, WEBAPP_URL } from './config';

export class Bot {
  private bot: Telegraf;
  private messagesPath = path.join(__dirname, '../src/models/messages.json');
  private groupsPath = path.join(__dirname, '../src/models/groups.json');
  private chatIds: Set<number> = new Set();

  constructor() {
    console.log('Initializing bot with token:', BOT_TOKEN);
    console.log('WebApp URL:', WEBAPP_URL);

    if (!BOT_TOKEN) {
      throw new Error('BOT_TOKEN must be provided!');
    }

    this.bot = new Telegraf(BOT_TOKEN);
    this.setupCommands();
    this.setupWebApp();
  }

  private setupCommands(): void {
    this.bot.command('start', (ctx: Context) => {
      const chatId = ctx.message?.chat.id;
      if (chatId) {
        this.chatIds.add(chatId);
      }
      ctx.reply('Вітаю! Використовуйте /send для відправки повідомлень у групи.');
    });

    this.bot.command('send', async (ctx: Context) => {
      try {
        const messages = await this.getMessages();
        const groups = await this.getGroups();

        for (const message of messages) {
          for (const group of groups) {
            try {
              await ctx.telegram.sendMessage(group.text, message.text);
              console.log(`Message sent to ${group.text}`);
            } catch (error) {
              console.error(`Error sending message to ${group.text}:`, error);
            }
          }
        }

        ctx.reply('Повідомлення успішно відправлені!');
      } catch (error) {
        console.error('Error in /send command:', error);
        ctx.reply('Помилка відправки повідомлень.');
      }
    });
  }

  private setupWebApp(): void {
    this.bot.command('webapp', (ctx: Context) => {
      ctx.reply('Відкрити веб-додаток', {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Відкрити', web_app: { url: WEBAPP_URL } }]
          ]
        }
      });
    });
  }

  private async getMessages(): Promise<Message[]> {
    try {
      const data = await fs.readFile(this.messagesPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading messages:', error);
      return [];
    }
  }

  private async getGroups(): Promise<Group[]> {
    try {
      const data = await fs.readFile(this.groupsPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading groups:', error);
      return [];
    }
  }

  public launch(): void {
    this.bot.launch();
    console.log('Bot started');

    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
  }

  public async sendMessage(chatId: string | number, text: string): Promise<void> {
    try {
      await this.bot.telegram.sendMessage(chatId, text);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  public async sendMessageToAll(text: string): Promise<void> {
    console.log('Sending message to all chats:', text);
    for (const chatId of this.chatIds) {
      try {
        await this.sendMessage(chatId, text);
        console.log('Message sent to chat:', chatId);
      } catch (error) {
        console.error('Error sending message to chat:', chatId, error);
      }
    }
  }
}