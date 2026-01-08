import { Book } from "../../books/models/book.model";
import { LoanStatus } from "./loan.model";


export interface LoanList {
    id: number;
    bookCopyId: number;
    loanDate: string;
    dueDate: string;
    returnDate?: string;
    status: LoanStatus;
    book: Book;
}