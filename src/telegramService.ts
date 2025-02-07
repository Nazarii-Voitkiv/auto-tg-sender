import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { NewMessage } from "telegram/events";
import { Api } from "telegram/tl";
import axios, { AxiosError } from "axios";
import supabase from "./supabase";
import * as readline from 'readline';
import { createInterface } from 'readline';

console.log('🔄 Initializing Telegram service...');

if (!process.env.TELEGRAM_API_ID || !process.env.TELEGRAM_API_HASH) {
  throw new Error("TELEGRAM_API_ID and TELEGRAM_API_HASH must be set in environment variables");
}

const apiId = process.env.TELEGRAM_API_ID;
const apiHash = process.env.TELEGRAM_API_HASH;

console.log('📱 Using Telegram API credentials:', { apiId });

let client: TelegramClient | null = null;

// Create readline interface for user input
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
};

async function initializeClient() {
  console.log('🔑 Initializing Telegram client...');
  try {
    const stringSession = new StringSession(""); // Always start with a new session
    console.log('📡 Creating new Telegram client...');
    client = new TelegramClient(stringSession, parseInt(apiId), apiHash, {
      connectionRetries: 5,
    });
    
    console.log('🔐 Starting authentication process...');
    await client.start({
      phoneNumber: async () => {
        console.log('📞 Requesting phone number...');
        return await question("Please enter your phone number: ");
      },
      password: async () => {
        console.log('🔒 Requesting password (if 2FA enabled)...');
        return await question("Please enter your password: ");
      },
      phoneCode: async () => {
        console.log('🔑 Requesting verification code...');
        return await question("Please enter the code you received: ");
      },
      onError: (err) => {
        console.error('❌ Authentication error:', err);
      },
    });
    console.log("✅ Successfully connected to Telegram!");
    
    return client;
  } catch (error) {
    console.error('❌ Error initializing client:', error);
    client = null; // Reset client on error
    throw error;
  }
}

// Function to ensure we have an authenticated client
export async function getAuthenticatedClient() {
  if (!client) {
    return await initializeClient();
  }
  return client;
}

interface SendStats {
  groupId: string;
  messageId: number;
  sentAt: Date;
  success: boolean;
}

async function validateGroup(groupId: string): Promise<boolean> {
  try {
    console.log(`🔍 Validating group ${groupId}...`);
    const client = await getAuthenticatedClient();
    const entity = await client.getEntity(groupId);
    console.log(`✅ Group ${groupId} is valid:`, entity);
    return !!entity;
  } catch (error) {
    console.error(`❌ Error validating group ${groupId}:`, error);
    return false;
  }
}

// Функція для випадкової затримки між повідомленнями (10-15 секунд)
const getRandomDelay = (): number => {
  return Math.floor(Math.random() * (15000 - 10000 + 1) + 10000); // 10000-15000 ms
};

// Функція для перемішування масиву
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const sendMessages = async () => {
  try {
    // Get authenticated client first
    const client = await getAuthenticatedClient();
    
    console.log('📨 Starting message sending process...');
    
    const { data: messages, error: messagesError } = await supabase.from("messages").select();
    const { data: groups, error: groupsError } = await supabase.from("groups").select();

    if (messagesError) {
      console.error('❌ Error fetching messages:', messagesError);
      return;
    }
    if (groupsError) {
      console.error('❌ Error fetching groups:', groupsError);
      return;
    }

    console.log(`📊 Found ${messages?.length || 0} messages and ${groups?.length || 0} groups`);

    if (!messages || !groups || messages.length === 0 || groups.length === 0) {
      console.log("❌ Немає повідомлень або груп для відправки.");
      return;
    }

    // Валідація груп перед відправкою
    const validGroups = [];
    for (const group of groups) {
      if (await validateGroup(group.group_id)) {
        validGroups.push(group);
      } else {
        console.log(`⚠️ Група ${group.group_id} недоступна.`);
        await supabase.from("groups").delete().eq("group_id", group.group_id);
      }
    }

    console.log(`✅ Found ${validGroups.length} valid groups`);

    if (validGroups.length === 0) {
      console.log("❌ Немає доступних груп для відправки.");
      return;
    }

    const stats: SendStats[] = [];

    // Перемішуємо групи для випадкового порядку відправки
    const shuffledGroups = shuffleArray(validGroups);

    for (const group of shuffledGroups) {
      try {
        if (!group.group_id) {
          console.error('❌ Пропуск групи: відсутній group_id');
          continue;
        }

        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        console.log(`📝 Selected random message:`, randomMessage);
        
        // Перевірка на дублікати
        const { data: recentSends } = await supabase
          .from("send_logs")
          .select()
          .eq("group_id", group.group_id)
          .eq("message_id", randomMessage.id)
          .gte("sentAt", new Date(Date.now() - 24 * 60 * 60 * 1000));

        if (recentSends && recentSends.length > 0) {
          console.log(`⚠️ Пропуск дубліката для групи ${group.group_id}`);
          continue;
        }

        console.log(`📣 Спроба відправки в групу ${group.group_id}...`);
        
        // Send message using Telegram user API
        const result = await client.sendMessage(group.group_id, { message: randomMessage.text });
        console.log(`📨 Message sent, result:`, result);

        // Логування відправки
        const { error: logError } = await supabase.from("send_logs").insert([{
          group_id: group.group_id,
          message_id: randomMessage.id,
          sent_at: new Date(),
          success: true
        }]);

        if (logError) {
          console.error('❌ Error logging message send:', logError);
        }

        stats.push({
          groupId: group.group_id,
          messageId: randomMessage.id,
          sentAt: new Date(),
          success: true
        });

        console.log(`✅ Повідомлення відправлено в групу ${group.group_id}`);

        // Випадкова затримка перед наступним повідомленням
        if (shuffledGroups.indexOf(group) < shuffledGroups.length - 1) {
          const delay = getRandomDelay();
          console.log(`⏳ Очікування ${delay/1000} секунд перед наступною відправкою...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Помилка надсилання в групу ${group.group_id}:`, errorMessage);
        console.error('Full error:', error);
        
        stats.push({
          groupId: group.group_id,
          messageId: -1,
          sentAt: new Date(),
          success: false
        });
      }
    }

    // Close readline interface
    rl.close();

    return stats;
  } catch (error) {
    console.error('❌ Error sending messages:', error);
    client = null; // Reset client on error to force re-authentication
  }
};