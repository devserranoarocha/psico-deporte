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
  
  // Modelo actualizado con el campo 'title'
  newsModel = {
    id: null as number | null,
    title: '',
    news_text: '',
    date: new Date().toISOString().split('T')[0]
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
        // La ordenación ahora viene preferiblemente del backend, 
        // pero reforzamos por ID descendente aquí.
        this.newsList = data.sort((a, b) => b.id - a.id);
        this.isLoading = false;
      },
      error: (err) => console.error('Error cargando noticias:', err)
    });
  }

selectedFile: File | null = null;

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  onSubmit(): void {
  const url = 'http://localhost:8000/api/news';
  const formData = new FormData();
  
  formData.append('title', this.newsModel.title);
  formData.append('news_text', this.newsModel.news_text);
  formData.append('date', this.newsModel.date);
  
  if (this.selectedFile) {
    formData.append('image', this.selectedFile);
  }

  this.http.post(url, formData, { headers: this.getHeaders() }).subscribe({
    next: () => {
      this.resetForm();
      this.loadNews();
      this.selectedFile = null;
    }
  });
  }

  resetForm(): void {
    this.isEditing = false;
    this.newsModel = { id: null, title: '', news_text: '', date: new Date().toISOString().split('T')[0] };
    this.selectedFile = null;
  }

  editNews(news: any): void {
    this.isEditing = true;
    // Clonamos el objeto para evitar editar la lista directamente antes de guardar
    this.newsModel = { ...news };
  }

  deleteNews(id: number): void {
    if (!confirm('¿Eliminar esta noticia definitivamente?')) return;
    this.http.delete(`http://localhost:8000/api/news/${id}`, { headers: this.getHeaders() }).subscribe({
      next: () => this.loadNews()
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/admin']);
  }
}