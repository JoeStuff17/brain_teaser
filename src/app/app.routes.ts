import { Routes } from '@angular/router';
import { Login } from './screens/login/login';
import { QuizPlay } from './screens/quiz/quiz-play/quiz-play';
import { QuizManagement } from './screens/quiz/quiz-management/quiz-management';
import { AuthGuard } from './core/auth.guard';
import { Home } from './screens/home/home';
import { Dashboard } from './screens/dashboard/dashboard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: 'dashboard',
    component: Dashboard,
    title: 'Dashboard'
  },
  {
    path: 'quiz',
    children: [
      {
        path: 'play',
        component: QuizPlay,
        title: 'Quiz Play',
        canActivate: [AuthGuard]
      },
      {
        path: 'management',
        component: QuizManagement,
        title: 'Quiz Management',
        canActivate: [AuthGuard]
      },
    ]
  },

  { path: 'login', component: Login },
  { path: '**', redirectTo: '/dashboard' }
];
