import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms'; // Añadido ReactiveFormsModule y FormControl
import { interval, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'; // Añadido para la búsqueda reactiva

@Component({
  selector: 'app-news-panel',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule], // Incluido ReactiveFormsModule
  templateUrl: './news-panel.component.html'
})
export class NewsPanelComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  currentDate: Date = new Date();
  newsList: any[] = [];
  filteredNews: any[] = []; // Lista para mostrar resultados filtrados
  isLoading: boolean = true;
  
  // Control reactivo para el buscador
  searchControl: FormControl = new FormControl('');

  newsModel = {
    id: null as number | null,
    title: '',
    news_text: '',
    date: new Date().toISOString().split('T')[0]
  };

  isEditing: boolean = false;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  
  private subscriptions: Subscription = new Subscription();

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadNews();
    
    // Suscripción al reloj
    this.subscriptions.add(
      interval(1000).subscribe(() => this.currentDate = new Date())
    );

    // Configuración de la búsqueda reactiva
    this.subscriptions.add(
      this.searchControl.valueChanges.pipe(
        debounceTime(300), // Espera 300ms tras dejar de escribir
        distinctUntilChanged() // Solo si el valor cambió
      ).subscribe(term => {
        this.filterNews(term);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  loadUserData(): void {
    // traemos los datos frescos de la API
    this.http.get('http://localhost:8000/api/me', { headers: this.getHeaders() }).subscribe({
      next: (user) => {
        this.currentUser = user;
        console.log('Usuario cargado desde API:', this.currentUser);
      },
      error: () => this.logout() // Si el token no es válido, fuera
    });
  }

  loadNews(): void {
    this.isLoading = true;
    this.http.get<any[]>('http://localhost:8000/api/news').subscribe({
      next: (data) => {
        this.newsList = data.sort((a, b) => b.id - a.id);
        this.filterNews(this.searchControl.value); // Aplicar filtro actual al cargar
        this.isLoading = false;
      },
      error: (err) => console.error('Error cargando noticias:', err)
    });
  }

  // Lógica de filtrado
  filterNews(term: string): void {
    if (!term) {
      this.filteredNews = [...this.newsList];
    } else {
      const lowerTerm = term.toLowerCase();
      this.filteredNews = this.newsList.filter(news => 
        news.title.toLowerCase().includes(lowerTerm)
      );
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
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
    if (news.image) {
      this.imagePreview = `http://localhost:8000/uploads/news/${news.image}`;
    } else {
      this.imagePreview = null;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll al formulario
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