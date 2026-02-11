// app.routes.ts
import { Routes } from '@angular/router';
import { LandingComponent } from './modules/landing/landing.component';
import { NewsComponent } from './modules/news/news.component';
import { LoginComponent } from './modules/login/login.component';
import { LoginRecoveryComponent } from './modules/login-recovery/login-recovery.component';
import { AdminPanelComponent } from './modules/admin-panel/admin-panel.component';
import { NewsPanelComponent } from './modules/news-panel/news-panel.component';
import { PasswordChangeComponent } from './modules/password-change/password-change.component';
// import { NotFoundComponent } from './not-found/not-found.component'; // Componente para manejar rutas no encontradas

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    title: 'Psicologia Deportiva' // Define el título de la página
  },
  { path: 'noticias', 
    component: NewsComponent,
    title: 'Psicologia Deportiva - Noticias' 
  },
  { path: 'admin',  // Acceso al login
    component: LoginComponent, 
    title: 'Psicologia Deportiva - Login'
  }, 
  { path: 'admin/recovery',  // Acceso a la recuperación de contraseña
    component: LoginRecoveryComponent, 
    title: 'Psicologia Deportiva - Recuperar Contraseña' 
  },
  { path: 'admin-panel', 
    component: AdminPanelComponent,
    title: 'Psicologia Deportiva - Panel Administrativo'
  },
  { path: 'news-panel',
    component: NewsPanelComponent,
    title: 'Psicologia Deportiva - Panel de Noticias'
  },
  { path: 'password-change',
    component: PasswordChangeComponent,
    title: 'Psicologia Deportiva - Cambiar Contraseña'
  },
 
/*
  {
    path: 'about',
    component: AboutComponent,
    title: 'Psicologia Deportiva - Quiénes Somos'
  },

  {
    path: 'services',
    component: ServicesComponent,
    title: 'Agencia Inmobiliaria - Nuestros Servicios'
  },

  {
    path: 'contact',
    component: ContactComponent,
    title: 'Agencia Inmobiliaria - Contáctanos'
  },

  {
    path: 'loginEmp',
    component: LoginEmpComponent,
    title: 'Agencia Inmobiliaria - Acceso empleados'
  },

  {
    path: 'legal',
    component: LegalComponent,
    title: 'Agencia Inmobiliaria - Aviso Legal'
  },

  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent,
    title: 'Agencia Inmobiliaria - Política de Privacidad'
  },

  {
    path: 'gestorPanel',
    component: GestorPanelComponent,
    title: 'Agencia Inmobiliaria - Gestor de Oficina'
  }*/
  /*{
    path: '**', // Ruta comodín para manejar cualquier otra URL
    component: NotFoundComponent
  }*/
];
