export type LoanStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE';

export interface Loan {
    id: number;
    bookCopyId: number;
    loanDate: string;
    dueDate: string;
    returnDate?: string;
    status: LoanStatus;
}