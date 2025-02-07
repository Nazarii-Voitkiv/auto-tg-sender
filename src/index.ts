import bot from './bot';
import scheduler from './scheduler';

async function startApp() {
  try {
    // Запуск бота
    await bot.launch();
    console.log('🤖 Бот успішно запущено!');

    // Запуск планувальника
    scheduler.start();
    console.log('⏰ Планувальник запущено!');
  } catch (error) {
    console.error('❌ Помилка запуску додатку:', error);
    process.exit(1);
  }
}

startApp();

// Обробка завершення роботи
process.once('SIGINT', () => {
  scheduler.pause();
  bot.stop('SIGINT');
  console.log('👋 Додаток завершує роботу...');
});

process.once('SIGTERM', () => {
  scheduler.pause();
  bot.stop('SIGTERM');
  console.log('👋 Додаток завершує роботу...');
});