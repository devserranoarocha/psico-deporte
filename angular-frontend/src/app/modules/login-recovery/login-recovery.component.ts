import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../services/toast.service'; // Asegúrate de que la ruta sea correcta

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

  constructor(
    private http: HttpClient, 
    private router: Router,
    private toastService: ToastService // Inyectamos el servicio
  ) {}

  onRecoverPassword(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.post<any>('http://localhost:8000/api/recover-password', this.recoveryData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.isSubmitted = true;
        // Lanzamos toast de éxito
        this.toastService.success('¡Identidad verificada! Revisa tu correo para la nueva clave.');
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Los datos introducidos no coinciden con ningún registro activo.';
        
        // Lanzamos toast de error
        this.toastService.error('Error de validación: Verifica los datos introducidos.');
        console.error('Recovery error:', err);
      }
    });
  }
}