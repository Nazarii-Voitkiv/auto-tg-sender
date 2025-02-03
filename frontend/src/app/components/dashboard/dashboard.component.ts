import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { EnvVars } from '../../interfaces/env.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  envForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {
    this.envForm = this.formBuilder.group({
      BOT_TOKEN: ['', Validators.required],
      WEBAPP_URL: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadEnvVars();
  }

  loadEnvVars(): void {
    this.apiService.getEnvVars().subscribe({
      next: (vars) => {
        this.envForm.patchValue(vars);
      },
      error: (error) => {
        console.error('Помилка завантаження змінних:', error);
        this.showSnackBar('Помилка завантаження змінних середовища');
      }
    });
  }

  saveEnvVars(): void {
    if (this.envForm.valid) {
      const vars: EnvVars = this.envForm.value;
      this.apiService.updateEnvVars(vars).subscribe({
        next: () => {
          this.showSnackBar('Зміни успішно збережено');
        },
        error: (error) => {
          console.error('Помилка оновлення змінних:', error);
          this.showSnackBar('Помилка оновлення змінних середовища');
        }
      });
    }
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Закрити', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}
