import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book } from '../../models/book.model';
import { BookDetails } from '../../models/book-details.model';

@Injectable({
  providedIn: 'root',
})
export class BooksService {
  private apiUrl = `${environment.apiUrl}/books`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiUrl);
  }

  getBooks(search?: string, page: number = 0, size: number = 12) {
    let params: any = { page, size };
    if (search) params.search = search;
    return this.http.get<any>(`${this.apiUrl}`, { params });
  }

  getById(id: number): Observable<BookDetails> {
    return this.http.get<BookDetails>(`${this.apiUrl}/${id}`);
  }
}
