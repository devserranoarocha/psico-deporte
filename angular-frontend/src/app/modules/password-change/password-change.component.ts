import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-password-change',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './password-change.component.html'
})
export class PasswordChangeComponent {
  passwordForm: FormGroup;
  errorMessage: string = '';
  isSubmitting: boolean = false;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.passwordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Validador personalizado para asegurar que las contraseñas coinciden
  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    this.http.post('http://localhost:8000/api/user/change-password', this.passwordForm.value, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          alert('Contraseña actualizada con éxito. Por seguridad, inicia sesión de nuevo.');
          this.logout();
        },
        error: (err) => {
          this.errorMessage = err.error.error || 'Error al cambiar la contraseña';
          this.isSubmitting = false;
        }
      });
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/admin']);
  }
}