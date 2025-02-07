import { sendMessages } from './telegramService';

class MessageScheduler {
  private interval: NodeJS.Timeout | null = null;
  private minInterval: number;
  private maxInterval: number;
  private isPaused: boolean = false;

  constructor(minMinutes: number = 1, maxMinutes: number = 120) {
    this.minInterval = minMinutes;
    this.maxInterval = maxMinutes;
  }

  private getRandomInterval(): number {
    return Math.floor(Math.random() * (this.maxInterval - this.minInterval + 1) + this.minInterval) * 60000;
  }

  public start(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }

    const scheduleNext = async () => {
      if (!this.isPaused) {
        await sendMessages();
        const nextInterval = this.getRandomInterval();
        console.log(`📅 Наступна розсилка через ${nextInterval / 60000} хвилин`);
        this.interval = setTimeout(scheduleNext, nextInterval);
      }
    };

    scheduleNext();
  }

  public pause(): void {
    this.isPaused = true;
    console.log('⏸️ Розсилку призупинено');
  }

  public resume(): void {
    this.isPaused = false;
    this.start();
    console.log('▶️ Розсилку відновлено');
  }

  public setInterval(min: number, max: number): void {
    this.minInterval = min;
    this.maxInterval = max;
    this.start();
  }
}

export default new MessageScheduler();