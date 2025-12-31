import { Routes } from '@angular/router';
import { BookList } from './pages/book-list/book-list';

export const BOOKS_ROUTES: Routes = [
  {
    path: '',
    component: BookList,
  },
];