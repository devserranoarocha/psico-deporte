import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsService } from '../../services/news.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './news.component.html',
  styleUrls: []
})
export class NewsComponent implements OnInit {
  newsList: any[] = [];
  isLoading: boolean = true;

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.loadNews();
  }

  loadNews(): void {
    this.isLoading = true;
    this.newsService.getNews().subscribe({
      next: (data) => {
        // Añadimos la propiedad 'isExpanded' a cada noticia
        this.newsList = data.map(item => ({ ...item, isExpanded: false }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar noticias', err);
        this.isLoading = false;
      }
    });
  }

  // Método para alternar entre expandido y contraído
  toggleExpand(item: any): void {
    item.isExpanded = !item.isExpanded;
  }
}