// app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NotificationToastComponent } from './shared/toast/toast.component'; 

@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [
    CommonModule, 
    RouterOutlet, 
    NotificationToastComponent 
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'angular-frontend';
}