import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Loan } from '../models/loan.model';
import { LoanCreateRequest } from '../models/loan-create-request.model';
import { environment } from '../../../../environments/environment';
import { LoanList } from '../models/loan-list.model';

@Injectable({
  providedIn: 'root',
})
export class LoansService {
  private apiUrl = `${environment.apiUrl}/loans`;

  constructor(private http: HttpClient) {}

  createLoan(request: LoanCreateRequest): Observable<Loan> {
    return this.http.post<Loan>(this.apiUrl, request);
  }

  getMyLoans(): Observable<LoanList[]> {
    return this.http.get<LoanList[]>(this.apiUrl);
  }

  returnLoan(loanId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${loanId}/return`, {});
  }
}
