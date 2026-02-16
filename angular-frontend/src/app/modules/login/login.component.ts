import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent {
  loginData = {
    username: '',
    password: ''
  };
  
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private http: HttpClient, 
    private router: Router,
    private toastService: ToastService 
  ) {}

  onLogin(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.post<any>('http://localhost:8000/api/login', this.loginData).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        
        // Lanzamos toast de éxito antes de redirigir
        this.toastService.success('¡Sesión iniciada con éxito! Bienvenido al panel.');
        
        this.router.navigate(['/admin-panel']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Credenciales incorrectas. Inténtalo de nuevo.';
        
        // Lanzamos toast de error para reforzar el mensaje
        this.toastService.error('Error de autenticación: verifica tus credenciales.');
        
        console.error('Login error:', err);
      }
    });
  }

  forgotPassword(): void {
    this.router.navigate(['/admin/recovery']);
  }
}