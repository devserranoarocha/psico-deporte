import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-news-panel',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './news-panel.component.html'
})
export class NewsPanelComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  currentDate: Date = new Date();
  newsList: any[] = [];
  filteredNews: any[] = [];
  isLoading: boolean = true;
  searchControl: FormControl = new FormControl('');

  ngModel = {
    id: null as number | null,
    title: '',
    news_text: '',
    date: new Date().toISOString().split('T')[0]
  };

  isEditing: boolean = false;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  
  private subscriptions: Subscription = new Subscription();

  constructor(
    private http: HttpClient, 
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadNews();
    this.subscriptions.add(interval(1000).subscribe(() => this.currentDate = new Date()));
    this.subscriptions.add(this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => this.filterNews(term)));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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
    this.http.get<any[]>('http://localhost:8000/api/news').subscribe({
      next: (data) => {
        this.newsList = data;
        this.filteredNews = data;
        this.isLoading = false;
      }
    });
  }

  filterNews(term: string): void {
    const lowTerm = term?.toLowerCase() || '';
    this.filteredNews = this.newsList.filter(n => 
      n.title.toLowerCase().includes(lowTerm) || 
      n.news_text.toLowerCase().includes(lowTerm)
    );
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    // VALIDACIÓN LÓGICA: Trim elimina espacios vacíos al inicio y final
    if (!this.ngModel.title.trim() || !this.ngModel.news_text.trim()) {
      this.toastService.error('Por favor, completa el título y el contenido.');
      return;
    }

    const formData = new FormData();
    formData.append('title', this.ngModel.title.trim());
    formData.append('news_text', this.ngModel.news_text.trim());
    formData.append('date', this.ngModel.date);
    
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    const endpoint = this.isEditing 
      ? `http://localhost:8000/api/news/${this.ngModel.id}/update` 
      : `http://localhost:8000/api/news`;

    this.http.post(endpoint, formData, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.toastService.success(this.isEditing ? 'Noticia actualizada' : 'Noticia publicada');
        this.resetForm();
        this.loadNews();
      },
      error: () => this.toastService.error('Error al guardar la noticia')
    });
  }

  editNews(news: any): void {
    this.isEditing = true;
    this.ngModel = { ...news };
    this.imagePreview = news.image ? `http://localhost:8000/uploads/news/${news.image}` : 'assets/images/no-image.jpg';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteNews(id: number): void {
    if (confirm('¿Eliminar esta noticia?')) {
      this.http.delete(`http://localhost:8000/api/news/${id}`, { headers: this.getHeaders() }).subscribe({
        next: () => {
          this.loadNews();
          this.toastService.success('Eliminado correctamente');
        }
      });
    }
  }

  resetForm(): void {
    this.isEditing = false;
    this.ngModel = { id: null, title: '', news_text: '', date: new Date().toISOString().split('T')[0] };
    this.selectedFile = null;
    this.imagePreview = null;
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/admin']);
  }
}