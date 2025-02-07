import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import supabase from "./supabase";
import scheduler from "./scheduler";
import { getAuthenticatedClient } from "./telegramService";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN as string);

bot.start((ctx) => ctx.reply(
  "👋 Вітаю! Доступні команди:\n" +
  "/addmessage [текст] - додати повідомлення\n" +
  "/listmessages - показати всі повідомлення\n" +
  "/delmessage [id] - видалити повідомлення\n" +
  "/addgroup [id] - додати групу\n" +
  "/listgroups - показати всі групи\n" +
  "/delgroup [id] - видалити групу\n" +
  "/setinterval [min] [max] - встановити інтервал розсилки\n" +
  "/pause - призупинити розсилку\n" +
  "/resume - відновити розсилку\n" +
  "/stats - показати статистику"
));

// Додавання повідомлення
bot.command("addmessage", async (ctx) => {
  const text = ctx.message.text.split(' ').slice(1).join(' ');
  
  if (!text) {
    return ctx.reply("❌ Будь ласка, вкажіть текст повідомлення\nПриклад: /addmessage Привіт, світ!");
  }

  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([{ text }])
      .select()
      .single();

    if (error) throw error;

    ctx.reply(`✅ Повідомлення збережено з ID: ${data.id}`);
  } catch (error) {
    console.error('Помилка додавання повідомлення:', error);
    ctx.reply('❌ Помилка при додаванні повідомлення');
  }
});

// Список повідомлень
bot.command("listmessages", async (ctx) => {
  const { data: messages, error } = await supabase
    .from("messages")
    .select("*")
    .order('created_at', { ascending: false });

  if (error || !messages?.length) {
    return ctx.reply("❌ Немає збережених повідомлень");
  }

  const messageList = messages
    .map(m => `ID: ${m.id}\n${m.text}\nСтворено: ${new Date(m.created_at).toLocaleString()}\n---`)
    .join("\n");
  
  ctx.reply(`📝 Збережені повідомлення:\n\n${messageList}`);
});

// Видалення повідомлення
bot.command("delmessage", async (ctx) => {
  const messageId = parseInt(ctx.message.text.split(' ')[1]);
  
  if (!messageId || isNaN(messageId)) {
    return ctx.reply("❌ Будь ласка, вкажіть ID повідомлення для видалення\nПриклад: /delmessage 1");
  }

  try {
    // Спочатку видаляємо логи
    await supabase
      .from('send_logs')
      .delete()
      .eq('message_id', messageId);

    // Потім видаляємо повідомлення
    const { error: deleteError } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (deleteError) throw deleteError;

    ctx.reply(`✅ Повідомлення з ID ${messageId} успішно видалено`);
  } catch (error) {
    console.error('Помилка:', error);
    ctx.reply('❌ Помилка при видаленні повідомлення');
  }
});

// Додавання групи
bot.command("addgroup", async (ctx) => {
  const groupId = ctx.message.text.split(' ')[1];
  
  if (!groupId) {
    return ctx.reply("❌ Будь ласка, вкажіть ID групи\nПриклад: /addgroup -1001234567890");
  }

  try {
    const { data, error } = await supabase
      .from('groups')
      .insert([{ 
        group_id: groupId,
        name: `Group ${groupId}`
      }])
      .select()
      .single();

    if (error) throw error;

    ctx.reply(`✅ Групу додано успішно!\nID: ${data.group_id}`);
  } catch (error) {
    console.error('Помилка додавання групи:', error);
    ctx.reply('❌ Помилка при додаванні групи');
  }
});

// Список груп
bot.command("listgroups", async (ctx) => {
  const { data: groups, error } = await supabase
    .from("groups")
    .select("*")
    .order('created_at', { ascending: false });

  if (error || !groups?.length) {
    return ctx.reply("❌ Немає збережених груп");
  }

  const groupList = groups
    .map(g => `ID: ${g.group_id}\nНазва: ${g.name}\nСтворено: ${new Date(g.created_at).toLocaleString()}\n---`)
    .join("\n");
  
  ctx.reply(`👥 Збережені групи:\n\n${groupList}`);
});

// Видалення групи
bot.command("delgroup", async (ctx) => {
  const groupId = ctx.message.text.split(' ')[1];
  
  if (!groupId) {
    return ctx.reply("❌ Будь ласка, вкажіть ID групи для видалення\nПриклад: /delgroup -1001234567890");
  }

  try {
    // Спочатку видаляємо логи
    await supabase
      .from('send_logs')
      .delete()
      .eq('group_id', groupId);

    // Потім видаляємо групу
    const { error: deleteError } = await supabase
      .from('groups')
      .delete()
      .eq('group_id', groupId);

    if (deleteError) throw deleteError;

    ctx.reply(`✅ Групу з ID ${groupId} успішно видалено`);
  } catch (error) {
    console.error('Помилка:', error);
    ctx.reply('❌ Помилка при видаленні групи');
  }
});

// Встановлення інтервалу
bot.command("setinterval", async (ctx) => {
  const [min, max] = ctx.message.text.split(' ').slice(1).map(Number);
  
  if (!min || !max || isNaN(min) || isNaN(max) || min >= max) {
    return ctx.reply("❌ Будь ласка, вкажіть правильний інтервал в хвилинах\nПриклад: /setinterval 30 60");
  }

  try {
    scheduler.setInterval(min, max);
    ctx.reply(`✅ Встановлено інтервал: ${min}-${max} хвилин`);
  } catch (error) {
    console.error('Помилка встановлення інтервалу:', error);
    ctx.reply('❌ Помилка при встановленні інтервалу');
  }
});

// Пауза
bot.command("pause", (ctx) => {
  scheduler.pause();
  ctx.reply("⏸️ Розсилку призупинено");
});

// Відновлення
bot.command("resume", (ctx) => {
  scheduler.resume();
  ctx.reply("▶️ Розсилку відновлено");
});

// Статистика
bot.command("stats", async (ctx) => {
  try {
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('count');
    
    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .select('count');
    
    const { data: logs, error: logsError } = await supabase
      .from('send_logs')
      .select('count');

    if (messagesError || groupsError || logsError) throw new Error('Помилка отримання статистики');

    const stats = `📊 Статистика:\n\n` +
      `📝 Повідомлень: ${messages[0].count}\n` +
      `👥 Груп: ${groups[0].count}\n` +
      `📨 Всього відправлено: ${logs[0].count}\n` +
      `⏱️ Статус розсилки: ${scheduler.isRunning() ? '▶️ Активна' : '⏸️ Призупинена'}`;

    ctx.reply(stats);
  } catch (error) {
    console.error('Помилка отримання статистики:', error);
    ctx.reply('❌ Помилка при отриманні статистики');
  }
});

// Функція запуску бота
async function startBot() {
  console.log("Запуск бота...");
  
  try {
    // Check database first
    console.log("📊 Перевірка бази даних...");
    const { data: messages, error: messagesError } = await supabase.from("messages").select();
    const { data: groups, error: groupsError } = await supabase.from("groups").select();

    if (messagesError || groupsError) {
      console.error('❌ Помилка перевірки бази даних:', { messagesError, groupsError });
      process.exit(1);
    }

    console.log(`📊 В базі даних знайдено: ${messages?.length || 0} повідомлень та ${groups?.length || 0} груп`);

    // Authenticate with Telegram first
    console.log("🔐 Authenticating with Telegram...");
    await getAuthenticatedClient();
    console.log("✅ Authentication successful!");

    // Launch the bot first
    await bot.launch();
    console.log("🤖 Бот успішно запущено!");
    
    // Start immediate sending if we have messages and groups
    if (messages?.length && groups?.length) {
      console.log("📨 Запуск першої розсилки...");
      await scheduler.sendNow();
    } else {
      console.log("⚠️ Розсилка не почалась: немає повідомлень або груп в базі даних");
    }
    
    // Start the scheduler after successful sending
    console.log("📅 Запуск планувальника...");
    scheduler.start();
    
    // Enable graceful stop
    process.once('SIGINT', () => {
      console.log('🛑 Stopping bot...');
      bot.stop('SIGINT');
      scheduler.pause();
    });
    process.once('SIGTERM', () => {
      console.log('🛑 Stopping bot...');
      bot.stop('SIGTERM');
      scheduler.pause();
    });
  } catch (error) {
    console.error("❌ Failed to start bot:", error);
    process.exit(1);
  }
}

// Запускаємо бота
startBot();

// Обробка завершення роботи
process.once('SIGINT', () => {
  bot.stop('SIGINT');
  console.log('👋 Бот завершує роботу...');
});

process.once('SIGTERM', () => {
  bot.stop('SIGTERM');
  console.log('👋 Бот завершує роботу...');
});

export default bot;