import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LoansService } from '../../services/loan.service';
import { LoanList } from '../../models/loan-list.model';
import { Subject, catchError, of, startWith, switchMap } from 'rxjs';
import { LoanListCard } from '../../components/loan-list-card/loan-list-card';

@Component({
  standalone: true,
  selector: 'app-loan-list',
  imports: [LoanListCard],
  templateUrl: './loan-list.html',
  styleUrl: './loan-list.scss',
})
export class LoanListView {

  private readonly loanService = inject(LoansService);

  private readonly reloadLoans$ = new Subject<void>();

  readonly loans = toSignal(
    this.reloadLoans$.pipe(
      startWith(undefined),
      switchMap(() =>
        this.loanService.getMyLoans().pipe(
          catchError((err) => {
            console.error('Error loading loans', err);
            return of([] as LoanList[]);
          })
        )
      )
    ),
    { initialValue: [] as LoanList[] }
  );

  reloadLoans() {
    this.reloadLoans$.next();
  }

  onReturnBook(loanId: number) {
    // Implementar la lógica para devolver el libro
    console.log(`Returning book for loan ID: ${loanId}`);

    this.loanService.returnLoan(loanId).subscribe({
      next: () => {
        console.log(`Book returned successfully for loan ID: ${loanId}`);
        // Recargar la lista de préstamos después de devolver el libro
        this.reloadLoans();
      },
      error: (err) => {
        console.error(`Error returning book for loan ID: ${loanId}`, err);
      }
    });
  }

}
