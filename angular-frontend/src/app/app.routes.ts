import { Routes } from '@angular/router';
import { LandingComponent } from './modules/landing/landing.component';
import { NewsComponent } from './modules/news/news.component';
import { LoginComponent } from './modules/login/login.component';
import { LoginRecoveryComponent } from './modules/login-recovery/login-recovery.component';
import { AdminPanelComponent } from './modules/admin-panel/admin-panel.component';
import { NewsPanelComponent } from './modules/news-panel/news-panel.component';
import { PasswordChangeComponent } from './modules/password-change/password-change.component';
import { NotFoundComponent } from './modules/not-found/not-found.component';
import { LegalComponent } from './modules/legal/legal.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    title: 'Psicologia Deportiva' 
  },
  { path: 'noticias', 
    component: NewsComponent,
    title: 'Psicologia Deportiva - Noticias' 
  },
  { path: 'admin',
    component: LoginComponent, 
    title: 'Psicologia Deportiva - Login'
  }, 
  { path: 'admin/recovery', 
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
  { path: 'legal',
    component: LegalComponent,
    title: 'Psicologia Deportiva - Aviso Legal'
  },

  { path: '404', 
    component: NotFoundComponent,
    title: 'Psicologia Deportiva - Página No Encontrada'
  },
  { path: '**',
    redirectTo: '/404',
    title: 'Psicologia Deportiva - Página No Encontrada'
  }
  
];
