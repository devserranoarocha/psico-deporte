import { Injectable } from '@angular/core';
// Importamos operadores Reactive Extensions for JavaScript
import { Subject, Observable, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';  

// Interfaz para el tipo de notificación
export interface ToastNotification {
  message: string;
  type: 'success' | 'error';
  duration?: number; // Duracion en milisegundos
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private ToastSubject = new Subject<ToastNotification | null>();
  private hideTimer$ = new Subject<void>(); // Cancela el timer de ocultar

  // Suscripcion para recibir notificaciones toast
  getToast(): Observable<ToastNotification | null> {
    return this.ToastSubject.asObservable();
  }

  // Métodos para los diferentes tipos de ToastNotification
  show(message: string, type: ToastNotification['type'], duration: number = 3000): void {
    const notification: ToastNotification = {message, type, duration};
    this.ToastSubject.next(notification);   // Mandamos la notificación

    // Temporizador para ocultar notificacion 
    this.hideTimer$.next(); // Cancelamos cualquier temporizador anterior
    timer(duration).pipe(
      takeUntil(this.hideTimer$) // Cancelamos el temporizador al llegar una nueva notificacion
    ).subscribe(() => {
      this.clear(); // Ocultamos tras la duracion establecida
    });
  }

  // Metodo en caso de exito
  success(message: string, duration?: number):void {
    this.show(message, 'success', duration);
  }

  // Metodo en caso de error
  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  // Metodo para ocultar la notificacion
  clear(): void{
    this.ToastSubject.next(null); // null para ocultar
  }
}
