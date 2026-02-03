import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // Esto hace que el servicio esté disponible en toda la App
})
export class ContactService {
  
  private apiUrl = 'http://localhost:8000/api/contact';

  constructor(private http: HttpClient) { }

  /**
   * Método para enviar el formulario. 
   * Recibe un objeto con {name, email, message}
   */
  sendForm(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}