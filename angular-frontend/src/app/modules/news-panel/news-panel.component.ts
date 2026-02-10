import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-news-panel',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './news-panel.component.html'
})
export class NewsPanelComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  currentDate: Date = new Date();
  newsList: any[] = [];
  isLoading: boolean = true;
  
  // Modelo para el formulario (Crear/Editar)
  newsModel = {
    id: null as number | null,
    news_text: '',
    date: new Date().toISOString().split('T')[0] // Fecha actual por defecto
  };

  isEditing: boolean = false;
  private timeSubscription?: Subscription;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadNews();
    this.timeSubscription = interval(1000).subscribe(() => this.currentDate = new Date());
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

  loadNews(): void {
    this.http.get<any[]>('http://localhost:8000/api/news', { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        // Ordenar por ID descendente (o por fecha si prefieres)
        this.newsList = data.sort((a, b) => b.id - a.id);
        this.isLoading = false;
      },
      error: (err) => console.error('Error cargando noticias:', err)
    });
  }

  onSubmit(): void {
    const url = 'http://localhost:8000/api/news';
    const headers = this.getHeaders();

    if (this.isEditing && this.newsModel.id) {
      // Editar
      this.http.put(`${url}/${this.newsModel.id}`, this.newsModel, { headers }).subscribe({
        next: () => {
          this.resetForm();
          this.loadNews();
        }
      });
    } else {
      // Crear
      this.http.post(url, this.newsModel, { headers }).subscribe({
        next: () => {
          this.resetForm();
          this.loadNews();
        }
      });
    }
  }

  editNews(news: any): void {
    this.isEditing = true;
    this.newsModel = { ...news };
  }

  deleteNews(id: number): void {
    if (!confirm('¿Eliminar esta noticia definitivamente?')) return;
    this.http.delete(`http://localhost:8000/api/news/${id}`, { headers: this.getHeaders() }).subscribe({
      next: () => this.loadNews()
    });
  }

  resetForm(): void {
    this.isEditing = false;
    this.newsModel = { id: null, news_text: '', date: new Date().toISOString().split('T')[0] };
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/admin']);
  }
}