import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Book } from '../../models/book.model';

@Component({
  selector: 'app-book-card',
  imports: [],
  templateUrl: './book-card.html',
  styleUrl: './book-card.scss',
})
export class BookCard {
  @Input() book!: Book;
  @Output() viewDetails = new EventEmitter<number>();

  placeholder = 'assets/images/book-placeholder.jpg';

  onViewDetails() {
    this.viewDetails.emit(this.book.id);
  }

  
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;

    if (!img.src.includes('book-placeholder.jpg')) {
      img.src = this.placeholder;
    }
  }
}
