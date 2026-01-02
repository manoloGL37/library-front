import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BooksService } from '../../services/books/books';
import { BookDetails } from '../../models/book-details.model';
import { AlertService } from '../../../../shared/services/alert.service';

@Component({
  selector: 'app-book-details',
  imports: [],
  templateUrl: './book-details.html',
  styleUrl: './book-details.scss',
})
export class BookDetailsView {
  book = signal<BookDetails | null>(null);  // ahora es signal
  loading = signal(false);
  placeholder = 'assets/images/book-placeholder.jpg';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BooksService,
    private alertService: AlertService
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

  // Métodos que estaban comentados
  addToCart(): void {
    if (this.hasAvailableCopies()) {
      console.log('Añadiendo libro al carrito:', this.book()!.id);
      this.alertService.success('Libro añadido a préstamos');
      // this.cartService.addBook(this.book()!.id);
    }
  }

  hasAvailableCopies(): boolean {
    return (this.book()?.copies?.some((copy) => copy.status === 'AVAILABLE')) ?? false;
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
