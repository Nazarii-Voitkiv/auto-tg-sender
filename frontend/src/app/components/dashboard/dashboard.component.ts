import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
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
    MatButtonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  envForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService
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
        console.error('Error loading env vars:', error);
        alert('Error loading environment variables');
      }
    });
  }

  saveEnvVars(): void {
    if (this.envForm.valid) {
      const vars: EnvVars = this.envForm.value;
      this.apiService.updateEnvVars(vars).subscribe({
        next: () => {
          alert('Environment variables updated successfully');
        },
        error: (error) => {
          console.error('Error updating env vars:', error);
          alert('Error updating environment variables');
        }
      });
    }
  }
}
