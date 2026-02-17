import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = 'http://localhost:8000/api/news';

  constructor(private http: HttpClient) { }

  getNews(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createNews(newsText: string, date?: string): Observable<any> {
    const body = {
      news_text: newsText,
      date: date 
    };
    return this.http.post(this.apiUrl, body);
  }

  updateNews(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteNews(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}