import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { TelegramService } from './services/telegram.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule],
  template: `
    <div class="app-container" [class.dark-theme]="isDarkMode">
      <mat-toolbar>
        <div class="nav-container">
          <nav>
            <a mat-button routerLink="/messages" routerLinkActive="active">Повідомлення</a>
            <a mat-button routerLink="/groups" routerLinkActive="active">Групи</a>
            <a mat-button routerLink="/dashboard" routerLinkActive="active">Панель</a>
          </nav>
        </div>
      </mat-toolbar>

      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: #17212b;
      color: #ffffff;
    }

    .nav-container {
      width: 100%;
      display: flex;
      justify-content: center;
    }

    nav {
      display: flex;
      gap: 10px;
    }

    mat-toolbar {
      padding: 0;
      background-color: #232f3d !important;
      height: 48px;
    }

    .active {
      background-color: rgba(255, 255, 255, 0.1) !important;
    }

    a {
      color: #ffffff !important;
    }

    .dark-theme {
      --mdc-elevated-card-container-color: var(--tg-theme-secondary-bg-color);
      --mdc-outlined-card-container-color: var(--tg-theme-secondary-bg-color);
      --mat-card-subtitle-text-color: var(--tg-theme-hint-color);
    }

    router-outlet + * {
      display: block;
      width: 100%;
    }
  `]
})
export class AppComponent implements OnInit {
  isDarkMode = false;

  constructor(
    private router: Router,
    private telegramService: TelegramService
  ) {}

  ngOnInit() {
    // Підписуємося на зміни теми
    this.telegramService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });

    // Показуємо кнопку "Назад" при навігації
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (event.url !== '/messages') {
        this.telegramService.showBackButton();
        this.telegramService.onBackButtonClick(() => {
          this.router.navigate(['/messages']);
          this.telegramService.hideBackButton();
        });
      } else {
        this.telegramService.hideBackButton();
      }
    });
  }
}
