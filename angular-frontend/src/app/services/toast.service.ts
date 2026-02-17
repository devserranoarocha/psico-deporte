import { Injectable } from '@angular/core';
import { Subject, Observable, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';  

export interface ToastNotification {
  message: string;
  type: 'success' | 'error';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private ToastSubject = new Subject<ToastNotification | null>();
  private hideTimer$ = new Subject<void>();

  getToast(): Observable<ToastNotification | null> {
    return this.ToastSubject.asObservable();
  }

  show(message: string, type: ToastNotification['type'], duration: number = 3000): void {
    const notification: ToastNotification = {message, type, duration};
    this.ToastSubject.next(notification);  

    this.hideTimer$.next(); 
    timer(duration).pipe(
      takeUntil(this.hideTimer$) 
    ).subscribe(() => {
      this.clear(); 
    });
  }

  success(message: string, duration?: number):void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  clear(): void{
    this.ToastSubject.next(null);
  }
}
