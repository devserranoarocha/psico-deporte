import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';

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

  constructor(private http: HttpClient, private router: Router) {}

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
      error: () => this.logout()
    });
  }

  loadMessages(): void {
    this.http.get<any[]>('http://localhost:8000/api/contact', { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.messages = data;
        this.isLoading = false;
      },
      error: (err) => console.error('Error:', err)
    });
  }

  toggleReadStatus(msg: any): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    // Llamamos al endpoint de toggle
    this.http.patch<any>(`http://localhost:8000/api/contact/${msg.id}/toggle-read`, {}, { headers }).subscribe({
      next: (response) => {
        // Actualizamos el objeto local con la respuesta real del servidor
        msg.read = response.read;
        console.log(`Mensaje ${msg.id} actualizado a leído: ${msg.read}`);
      },
      error: (err) => {
        console.error('Error al guardar el estado en la BD', err);
        alert('No se pudo actualizar el estado del mensaje en el servidor.');
      }
    });
  }

  deleteMsg(id: number): void {
    if (confirm('¿Eliminar mensaje?')) {
      this.http.delete(`http://localhost:8000/api/contact/${id}`, { headers: this.getHeaders() }).subscribe({
        next: () => this.messages = this.messages.filter(m => m.id !== id)
      });
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/admin']);
  }
}