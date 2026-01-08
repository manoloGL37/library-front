import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-loan-confirm-modal',
  imports: [],
  templateUrl: './loan-confirm-modal.html',
  styleUrl: './loan-confirm-modal.scss',
})
export class LoanConfirmModal {
  @Input({required: true}) bookTitle!: string;
  @Output() confirm = new EventEmitter<14 | 30 | 60>();
  @Output() cancel = new EventEmitter<void>();

  selectedDays = signal<14 | 30 | 60>(14);

  confirmLoan(): void {
    this.confirm.emit(this.selectedDays());
  }

}
