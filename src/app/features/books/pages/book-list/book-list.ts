import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { BooksService } from '../../services/books/books';
import { Book } from '../../models/book.model';
import { catchError, finalize, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { BookCard } from "../../components/book-card/book-card";

@Component({
  standalone: true,
  selector: 'app-book-list',
  imports: [CommonModule, BookCard],
  templateUrl: './book-list.html',
  styleUrl: './book-list.scss',
})
export class BookList {
  books: Book[] = [];
  isLoading = true;

  constructor(
    private booksService: BooksService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks() {
    this.isLoading = true;

    this.booksService
      .getAll()
      .pipe(
        catchError((err) => {
          console.error('Error al cargar libros', err);
          return of([] as Book[]);
        }),
        finalize(() => {
          // asegura que el loading se apague y se renderice
          this.zone.run(() => (this.isLoading = false));
          this.cdr.detectChanges();
        })
      )
      .subscribe((data) => {
        this.zone.run(() => {
          this.books = data ?? [];
        });
      });
  }

  goToDetails(bookId: number) {
    this.router.navigate([bookId], { relativeTo: this.route });
    // o absolute: ['/books', bookId]
  }
}
