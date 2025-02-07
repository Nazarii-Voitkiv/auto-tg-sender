import express from "express";
import dotenv from "dotenv";
import { sendMessages } from "./telegramService";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Головна сторінка
app.get("/", (req, res) => {
  res.send("✅ Сервер автоматичної розсилки працює!");
});

// Ендпоінт для ручного запуску розсилки
app.post("/send", async (req, res) => {
  try {
    await sendMessages();
    res.json({ success: true, message: "Розсилку успішно виконано" });
  } catch (error) {
    console.error("Помилка при виконанні розсилки:", error);
    res.status(500).json({ 
      success: false, 
      message: "Помилка при виконанні розсилки" 
    });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущено на порту ${PORT}`);
});
