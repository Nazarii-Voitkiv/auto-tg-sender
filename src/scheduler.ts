import { sendMessages } from './telegramService';

class MessageScheduler {
  private timer: NodeJS.Timeout | null = null;
  private minInterval: number = 30; // за замовчуванням 30 хвилин
  private maxInterval: number = 60; // за замовчуванням 60 хвилин
  private running: boolean = false;

  constructor() {
    console.log('📅 Створення планувальника...');
    this.start(); // Автоматично запускаємо планувальник
  }

  private getRandomInterval(): number {
    return Math.floor(Math.random() * (this.maxInterval - this.minInterval + 1) + this.minInterval) * 60000;
  }

  private async scheduleNext() {
    if (!this.running) return;

    try {
      await sendMessages();
    } catch (error) {
      console.error('❌ Помилка при відправці повідомлень:', error);
    }

    const nextInterval = this.getRandomInterval();
    console.log(`⏰ Наступна розсилка через ${nextInterval / 60000} хвилин`);
    
    this.timer = setTimeout(() => this.scheduleNext(), nextInterval);
  }

  public start() {
    if (!this.running) {
      this.running = true;
      this.scheduleNext();
      console.log('▶️ Планувальник запущено');
    }
  }

  public pause() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.running = false;
    console.log('⏸️ Планувальник призупинено');
  }

  public resume() {
    if (!this.running) {
      this.running = true;
      this.scheduleNext();
      console.log('▶️ Планувальник відновлено');
    }
  }

  public setInterval(min: number, max: number) {
    if (min >= max) {
      throw new Error('Мінімальний інтервал має бути менше максимального');
    }
    this.minInterval = min;
    this.maxInterval = max;
    console.log(`⚙️ Встановлено новий інтервал: ${min}-${max} хвилин`);
  }

  public isRunning(): boolean {
    return this.running;
  }
}

export default new MessageScheduler();