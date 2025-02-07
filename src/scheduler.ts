import { sendMessages } from './telegramService';

class MessageScheduler {
  private timer: NodeJS.Timeout | null = null;
  private minInterval: number = 30; // за замовчуванням 30 хвилин
  private maxInterval: number = 60; // за замовчуванням 60 хвилин
  private running: boolean = false;
  private nextSendTime: Date | null = null;

  constructor() {
    console.log('📅 Створення планувальника...');
  }

  private getRandomInterval(): number {
    return Math.floor(Math.random() * (this.maxInterval - this.minInterval + 1) + this.minInterval) * 60000;
  }

  private async scheduleNext() {
    if (!this.running) return;

    const nextInterval = this.getRandomInterval();
    this.nextSendTime = new Date(Date.now() + nextInterval);
    console.log(`⏰ Наступна розсилка через ${nextInterval / 60000} хвилин`);
    
    this.timer = setTimeout(async () => {
      try {
        await sendMessages();
        this.scheduleNext(); // Schedule next only after successful sending
      } catch (error) {
        console.error('❌ Помилка при відправці повідомлень:', error);
        this.scheduleNext(); // Still schedule next even if there was an error
      }
    }, nextInterval);
  }

  public async sendNow() {
    try {
      console.log('📨 Відправка повідомлень...');
      await sendMessages();
      console.log('✅ Повідомлення відправлені');
      
      // Якщо планувальник запущений, оновлюємо час наступної відправки
      if (this.running) {
        if (this.timer) {
          clearTimeout(this.timer);
        }
        this.scheduleNext();
      }
    } catch (error) {
      console.error('❌ Помилка при відправці повідомлень:', error);
    }
  }

  public start() {
    if (!this.running) {
      this.running = true;
      console.log('▶️ Планувальник запущено');
      this.scheduleNext();
    }
  }

  public pause() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.running = false;
    this.nextSendTime = null;
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

    // Якщо планувальник запущений, оновлюємо розклад
    if (this.running) {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.scheduleNext();
      console.log('🔄 Розклад оновлено з новим інтервалом');
    }
  }

  public isRunning(): boolean {
    return this.running;
  }

  public getNextSendTime(): Date | null {
    return this.nextSendTime;
  }
}

export default new MessageScheduler();