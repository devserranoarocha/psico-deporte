import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { ToastService } from '../../services/toast.service'; // Asegúrate de que la ruta sea correcta

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-panel.component.html'
})
export class AdminPanelComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  currentDate: Date = new Date();
  messages: any[] = [];
  isLoading: boolean = true;
  private timeSubscription?: Subscription;

  constructor(
    private http: HttpClient, 
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadMessages();
    
    // Reloj en tiempo real
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
      error: () => {
        this.toastService.error('Sesión expirada. Por favor, vuelve a entrar.');
        this.logout();
      }
    });
  }

  loadMessages(): void {
    this.http.get<any[]>('http://localhost:8000/api/contact', { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.messages = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastService.error('No se pudieron cargar los mensajes.');
        console.error('Error:', err);
      }
    });
  }

  toggleReadStatus(msg: any): void {
    const headers = this.getHeaders();
    
    this.http.patch<any>(`http://localhost:8000/api/contact/${msg.id}/toggle-read`, {}, { headers }).subscribe({
      next: (response) => {
        msg.read = response.read;
        const estado = msg.read ? 'leído' : 'pendiente';
        this.toastService.success(`Mensaje marcado como ${estado}.`);
      },
      error: (err) => {
        console.error('Error al guardar el estado en la BD', err);
        this.toastService.error('No se pudo actualizar el estado del mensaje.');
      }
    });
  }

  deleteMsg(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este mensaje?')) {
      this.http.delete(`http://localhost:8000/api/contact/${id}`, { headers: this.getHeaders() }).subscribe({
        next: () => {
          this.messages = this.messages.filter(m => m.id !== id);
          this.toastService.success('Mensaje eliminado correctamente.');
        },
        error: (err) => {
          this.toastService.error('Error al eliminar el mensaje.');
          console.error(err);
        }
      });
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    this.toastService.success('Sesión cerrada correctamente.');
    this.router.navigate(['/admin']);
  }
}