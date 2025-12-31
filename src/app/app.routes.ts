import { Routes } from '@angular/router';

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
        children: [
            {
                path: 'books',
                loadChildren: () =>
                    import('./features/books/books.routes')
                        .then(m => m.BOOKS_ROUTES),
            },
            {
                path: '',
                redirectTo: 'auth/login',
                pathMatch: 'full'
            }
        ]
        
    }
];
