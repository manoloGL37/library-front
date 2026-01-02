import { Routes } from '@angular/router';
import { BookList } from './pages/book-list/book-list';
import { BookDetailsView } from './pages/book-details/book-details';

export const BOOKS_ROUTES: Routes = [
  {
    path: '',
    component: BookList,
  },
  {
    path: ':id',
    component: BookDetailsView
  }
];