import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import supabase from "./supabase";
import scheduler from "./scheduler";

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
  const text = ctx.message.text.split("/addmessage ")[1];
  if (!text) return ctx.reply("❌ Введіть повідомлення!");

  const { error } = await supabase
    .from("messages")
    .insert([{ text, created_at: new Date() }]);

  if (error) return ctx.reply("❌ Помилка збереження повідомлення!");
  ctx.reply("✅ Повідомлення додано!");
});

// Список повідомлень
bot.command("listmessages", async (ctx) => {
  const { data: messages, error } = await supabase
    .from("messages")
    .select("*");

  if (error || !messages.length) {
    return ctx.reply("❌ Немає збережених повідомлень");
  }

  const messageList = messages
    .map(m => `ID: ${m.id}\n${m.text}\n---`)
    .join("\n");
  
  ctx.reply(`📝 Збережені повідомлення:\n\n${messageList}`);
});

// Керування розсилкою
bot.command("pause", (ctx) => {
  scheduler.pause();
  ctx.reply("⏸️ Розсилку призупинено");
});

bot.command("resume", (ctx) => {
  scheduler.resume();
  ctx.reply("▶️ Розсилку відновлено");
});

bot.command("setinterval", (ctx) => {
  const [min, max] = ctx.message.text
    .split("/setinterval ")[1]
    .split(" ")
    .map(Number);

  if (!min || !max || min >= max) {
    return ctx.reply("❌ Використовуйте формат: /setinterval [min] [max]");
  }

  scheduler.setInterval(min, max);
  ctx.reply(`⏱️ Встановлено інтервал: ${min}-${max} хвилин`);
});

bot.launch();
console.log("🤖 Бота запущено!");