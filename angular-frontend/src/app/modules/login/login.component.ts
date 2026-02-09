import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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

  constructor(private http: HttpClient, private router: Router) {}

  onLogin(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Llamada al endpoint definido en security.yaml y AuthController
    this.http.post<any>('http://localhost:8000/api/login', this.loginData).subscribe({
      next: (response) => {
        // Guardamos el token (LexikJWT devuelve 'token')
        localStorage.setItem('token', response.token);
        // Redirigimos al panel de administración
        this.router.navigate(['/admin-panel']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Credenciales incorrectas. Inténtalo de nuevo.';
        console.error('Login error:', err);
      }
    });
  }

  forgotPassword(): void {
    this.router.navigate(['/admin/recovery']);
  }
}