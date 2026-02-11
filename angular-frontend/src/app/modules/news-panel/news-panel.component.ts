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
  
  newsModel = {
    id: null as number | null,
    title: '',
    news_text: '',
    date: new Date().toISOString().split('T')[0]
  };

  isEditing: boolean = false;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null; // Variable para la vista previa
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
    const user = localStorage.getItem('user');
    if (user) this.currentUser = JSON.parse(user);
  }

  loadNews(): void {
    this.isLoading = true;
    this.http.get<any[]>('http://localhost:8000/api/news').subscribe({
      next: (data) => {
        this.newsList = data.sort((a, b) => b.id - a.id);
        this.isLoading = false;
      },
      error: (err) => console.error('Error cargando noticias:', err)
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Lógica para generar la previsualización
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    const formData = new FormData();
    formData.append('title', this.newsModel.title);
    formData.append('news_text', this.newsModel.news_text);
    formData.append('date', this.newsModel.date);
    
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    const headers = this.getHeaders();
    const endpoint = this.isEditing 
      ? `http://localhost:8000/api/news/${this.newsModel.id}/update` 
      : `http://localhost:8000/api/news`;

    this.http.post(endpoint, formData, { headers }).subscribe({
      next: () => {
        this.resetForm();
        this.loadNews();
        alert(this.isEditing ? '¡Actualizado!' : '¡Publicado!');
      },
      error: (err) => alert('Error en la operación')
    });
  }

  editNews(news: any): void {
    this.isEditing = true;
    this.newsModel = { ...news };
    
    // Al editar, mostramos la imagen que ya tiene en el servidor
    if (news.image) {
      this.imagePreview = `http://localhost:8000/uploads/news/${news.image}`;
    } else {
      this.imagePreview = null;
    }
  }

  deleteNews(id: number): void {
    if (!confirm('¿Eliminar esta noticia definitivamente?')) return;
    this.http.delete(`http://localhost:8000/api/news/${id}`, { headers: this.getHeaders() }).subscribe({
      next: () => this.loadNews()
    });
  }

  resetForm(): void {
    this.isEditing = false;
    this.newsModel = { id: null, title: '', news_text: '', date: new Date().toISOString().split('T')[0] };
    this.selectedFile = null;
    this.imagePreview = null;
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}