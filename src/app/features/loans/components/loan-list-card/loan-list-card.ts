import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LoanList } from '../../models/loan-list.model';

@Component({
  selector: 'app-loan-list-card',
  imports: [],
  templateUrl: './loan-list-card.html',
  styleUrl: './loan-list-card.scss',
})
export class LoanListCard {

  @Input({required: true}) loan!: LoanList;
  @Output() returnBookId = new EventEmitter<number>();

  returnBook() {
    this.returnBookId.emit(this.loan.id);
  }

}
