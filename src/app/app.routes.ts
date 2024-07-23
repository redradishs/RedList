import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { AddtaskComponent } from './pages/addtask/addtask.component';
import { EdittaskComponent } from './pages/edittask/edittask.component';
import { TaskdemoComponent } from './pages/taskdemo/taskdemo.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'home',
        component: HomeComponent,     canActivate: [authGuard]
    }, 
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'signup',
        component: SignupComponent
    },
    {
        path: 'addtask',
        component: AddtaskComponent,     canActivate: [authGuard]
    },
    {
        path: 'edittask',
        component: EdittaskComponent,     canActivate: [authGuard]
    },
    {
        path: 'demoproject',
        component: TaskdemoComponent,     canActivate: [authGuard]
    }, 
    {
        path: '**',
        redirectTo: 'home',
    }
];
