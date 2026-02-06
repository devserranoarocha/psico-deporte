import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login-recovery',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login-recovery.component.html',
  styles: []
})
export class LoginRecoveryComponent {
  recoveryData = {
    username: '',
    email: ''
  };
  
  isLoading: boolean = false;
  errorMessage: string = '';
  isSubmitted: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  onRecoverPassword(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Enviamos ambos campos al backend
    this.http.post<any>('http://localhost:8000/api/recover-password', this.recoveryData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.isSubmitted = true;
      },
      error: (err) => {
        this.isLoading = false;
        // Mensaje genérico por seguridad, recomendando contactar al admin
        this.errorMessage = 'Los datos introducidos no coinciden con ningún registro activo. Por favor, verifica la información o contacta con el administrador del sitio.';
        console.error('Recovery error:', err);
      }
    });
  }
}