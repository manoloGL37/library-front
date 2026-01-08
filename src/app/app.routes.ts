import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () =>
             import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
    },
    {
        path: '',
        loadComponent: () =>
            import('./layouts/app-layout/app-layout')
                .then(m => m.AppLayout),
        canActivate: [authGuard],
        children: [
            {
                path: 'books',
                loadChildren: () =>
                    import('./features/books/books.routes')
                        .then(m => m.BOOKS_ROUTES),
            },
            {
                path: 'loans',
                loadChildren: () =>
                    import('./features/loans/loans.routes')
                        .then(m => m.LOANS_ROUTES),
            },
            {
                path: '',
                redirectTo: 'auth/login',
                pathMatch: 'full'
            }
        ]
        
    }
];
