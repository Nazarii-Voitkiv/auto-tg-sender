import { Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready(): void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          show(): void;
          hide(): void;
          setText(text: string): void;
          onClick(fn: Function): void;
          offClick(fn: Function): void;
          enable(): void;
          disable(): void;
        };
        BackButton: {
          show(): void;
          hide(): void;
          onClick(fn: Function): void;
        };
        onEvent(eventType: string, callback: Function): void;
        sendData(data: any): void;
        expand(): void;
        close(): void;
        themeParams: {
          bg_color: string;
          text_color: string;
          hint_color: string;
          button_color: string;
          button_text_color: string;
        };
      };
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class TelegramService {
  private webApp: any;
  private _isDarkMode = new BehaviorSubject<boolean>(false);
  isDarkMode$ = this._isDarkMode.asObservable();
  private clickHandler: Function | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    console.log('TelegramService initialized');
    if (isPlatformBrowser(this.platformId)) {
      this.webApp = window.Telegram.WebApp;
      this.init();
    }
  }

  private init(): void {
    console.log('Initializing Telegram WebApp');
    if (!this.webApp) return;

    // Повідомляємо Telegram, що додаток готовий
    console.log('Telegram WebApp ready');
    this.webApp.ready();

    // Розгортаємо додаток на весь екран
    console.log('Expanding WebApp');
    this.webApp.expand();

    // Встановлюємо тему
    this._isDarkMode.next(this.webApp.themeParams.bg_color === '#000000');

    // Слухаємо зміни теми
    this.webApp.onEvent('themeChanged', () => {
      console.log('Theme changed');
      if (this.webApp) {
        this._isDarkMode.next(this.webApp.themeParams.bg_color === '#000000');
      }
    });
  }

  sendData(data: any): void {
    console.log('Sending data to Telegram:', JSON.stringify(data));
    try {
      if (!this.webApp) return;
      this.webApp.sendData(JSON.stringify(data));
      console.log('Data sent successfully');
    } catch (error) {
      console.error('Error sending data:', error);
      alert('Error sending data: ' + JSON.stringify(error));
    }
  }

  showMainButton(text: string): void {
    console.log('Showing main button with text:', text);
    if (!this.webApp) return;
    this.webApp.MainButton.text = text;
    this.webApp.MainButton.show();
  }

  hideMainButton(): void {
    console.log('Hiding main button');
    if (!this.webApp) return;
    this.webApp.MainButton.hide();
  }

  onMainButtonClick(callback: Function): void {
    console.log('Setting up main button click handler');
    if (!this.webApp) return;
    
    // Зберігаємо обробник
    this.clickHandler = callback;
    
    // Встановлюємо обробник
    this.webApp.MainButton.onClick(() => {
      console.log('Main button clicked, executing handler');
      if (this.clickHandler) {
        this.clickHandler();
      }
    });
  }

  offMainButtonClick(callback: Function): void {
    console.log('Removing main button click handler');
    if (!this.webApp) return;
    
    // Видаляємо обробник
    if (this.clickHandler === callback) {
      this.clickHandler = null;
    }
    
    // Видаляємо обробник з кнопки
    this.webApp.MainButton.offClick(callback);
  }

  showBackButton(): void {
    console.log('Showing back button');
    if (!this.webApp) return;
    this.webApp.BackButton.show();
  }

  hideBackButton(): void {
    console.log('Hiding back button');
    if (!this.webApp) return;
    this.webApp.BackButton.hide();
  }

  onBackButtonClick(callback: Function): void {
    console.log('Setting up back button click handler');
    if (!this.webApp) return;
    this.webApp.BackButton.onClick(callback);
  }
}