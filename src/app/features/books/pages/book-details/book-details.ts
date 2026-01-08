import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BooksService } from '../../services/books/books.service';
import { BookDetails } from '../../models/book-details.model';
import { AlertService } from '../../../../shared/services/alert.service';
import { LoanConfirmModal } from "../../../loans/components/loan-confirm-modal/loan-confirm-modal";
import { LoansService } from '../../../loans/services/loan.service';

@Component({
  selector: 'app-book-details',
  imports: [LoanConfirmModal],
  templateUrl: './book-details.html',
  styleUrl: './book-details.scss',
})
export class BookDetailsView {
  book = signal<BookDetails | null>(null); // ahora es signal
  loading = signal(false);
  placeholder = 'assets/images/book-placeholder.jpg';

  showLoanModal = signal(false);
  selectedBook = signal<BookDetails | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BooksService,
    private alertService: AlertService,
    private loansService: LoansService
  ) {}

  ngOnInit(): void {
    const bookId = this.route.snapshot.paramMap.get('id');
    if (bookId) this.loadBook(Number(bookId));
  }

  private loadBook(bookId: number): void {
    this.loading.set(true);
    this.bookService.getById(bookId).subscribe({
      next: (data) => {
        this.book.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar el libro', err);
        this.loading.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/books']);
  }

  openLoanModal(book: BookDetails | null): void {
    this.selectedBook.set(book);
    this.showLoanModal.set(true);
  }

  closeLoanModal(): void {
    this.showLoanModal.set(false);
    this.selectedBook.set(null);
  }

  onConfirmLoan(days: 14 | 30 | 60): void {
    const book = this.selectedBook();

    if (!book) return;

    this.loansService
      .createLoan({
        bookId: book.id,
        loanDays: days,
      })
      .subscribe({
        next: () => {
          this.closeLoanModal();
          this.alertService.success('Préstamo creado con éxito.');
          this.loadBook(book.id);
          // toast success
        },
        error: () => {
          // toast error
          this.alertService.error('Error al crear el préstamo. Inténtalo de nuevo más tarde.');
        },
      });
  }

  hasAvailableCopies(): boolean {
    return this.book()?.copies?.some((copy) => copy.status === 'AVAILABLE') ?? false;
  }

  getAvailableCopiesCount(): number {
    return this.book()?.copies?.filter((copy) => copy.status === 'AVAILABLE').length ?? 0;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      AVAILABLE: 'bg-green-100 text-green-700',
      LOANED: 'bg-yellow-100 text-yellow-700',
      RESERVED: 'bg-blue-100 text-blue-700',
      REMOVED: 'bg-red-100 text-red-700',
    };
    return classes[status] || 'bg-gray-100 text-gray-700';
  }

  getStatusText(status: string): string {
    const texts: Record<string, string> = {
      AVAILABLE: 'Disponible',
      LOANED: 'Prestado',
      RESERVED: 'Reservado',
      REMOVED: 'Retirado',
    };
    return texts[status] || 'Desconocido';
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;

    if (!img.src.includes('book-placeholder.jpg')) {
      img.src = this.placeholder;
    }
  }
}
