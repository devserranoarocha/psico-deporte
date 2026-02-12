import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-password-change',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './password-change.component.html'
})
export class PasswordChangeComponent implements OnInit, OnDestroy {
  passwordForm: FormGroup;
  errorMessage: string = '';
  isSubmitting: boolean = false;

  // Propiedades para la Navbar idéntica al admin-panel
  currentUser: any = null;
  currentDate: Date = new Date();
  private timeSubscription?: Subscription;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.passwordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadUserData();
    // Iniciar el reloj en tiempo real
    this.timeSubscription = interval(1000).subscribe(() => {
      this.currentDate = new Date();
    });
  }

  ngOnDestroy(): void {
    this.timeSubscription?.unsubscribe();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  loadUserData(): void {
    this.http.get('http://localhost:8000/api/me', { headers: this.getHeaders() }).subscribe({
      next: (user) => this.currentUser = user,
      error: () => this.logout()
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
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