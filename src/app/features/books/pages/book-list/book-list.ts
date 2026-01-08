import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { BooksService } from '../../services/books/books.service';
import { Book } from '../../models/book.model';
import { catchError, finalize, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { BookCard } from "../../components/book-card/book-card";
import { FormsModule } from '@angular/forms';
import { ChatWidget } from "../../../ai-chat/components/chat-widget/chat-widget";

type BooksPageResponse = {
  content?: Book[];
  totalPages?: number;
  page?: { totalPages?: number };
};

@Component({
  standalone: true,
  selector: 'app-book-list',
  imports: [CommonModule, BookCard, FormsModule, ChatWidget],
  templateUrl: './book-list.html',
  styleUrl: './book-list.scss',
})
export class BookList {
  books: Book[] = [];
  isLoading = true;
  searchTerm = '';

  page = 0;
  size = 12;
  totalPages = 0;

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

    if (this.searchTerm.trim() != '') {
      this.page = 0;
    }

    this.booksService
      .getBooks(this.searchTerm, this.page, this.size)
      .pipe(
        catchError((err) => {
          console.error(err);
          return of({ content: [], totalPages: 0 } satisfies BooksPageResponse);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((data: BooksPageResponse | Book[]) => {
        const books = Array.isArray(data) ? data : (data.content ?? []);
        const totalPages =
          (Array.isArray(data) ? undefined : data.totalPages) ??
          (Array.isArray(data) ? undefined : data.page?.totalPages) ??
          0;

        // Defensive: if the app ever runs in a zoneless setup,
        // ensure the UI still updates.
        this.zone.run(() => {
          this.books = books;
          this.totalPages = totalPages;
          this.cdr.detectChanges();
        });
      });
  }

  goToDetails(bookId: number) {
    this.router.navigate([bookId], { relativeTo: this.route });
    // o absolute: ['/books', bookId]
  }

  nextPage() {
    if (this.page + 1 < this.totalPages) {
      this.page++;
      this.loadBooks();
    }
  }

  previousPage() {
    if (this.page > 0) {
      this.page--;
      this.loadBooks();
    }
  }
}
