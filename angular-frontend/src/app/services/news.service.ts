import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  // URL base la API de Symfony
  private apiUrl = 'http://localhost:8000/api/news';

  constructor(private http: HttpClient) { }

  /**
   * GET - Obtener todas las noticias (Público)
   * Llama al método list() de NewsController
   */
  getNews(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  /**
   * POST - Crear una nueva noticia (Protegido)
   * Requiere Token JWT
   */
  createNews(newsText: string, date?: string): Observable<any> {
    const body = {
      news_text: newsText,
      date: date // Formato YYYY-MM-DD
    };
    return this.http.post(this.apiUrl, body);
  }

  /**
   * PUT/PATCH - Actualizar una noticia existente (Protegido)
   */
  updateNews(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  /**
   * DELETE - Eliminar una noticia (Protegido)
   */
  deleteNews(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}