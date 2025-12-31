export interface Book {
  id: number;                 // backend: Long -> frontend: number
  title: string;
  description?: string;
  author: string;
  genre?: string;
  isbn?: string;
  publisher?: string;
  year?: string;              // backend lo manda como String
  totalCopies?: number;       // backend: Integer
  availableCopies?: number;   // backend: Integer
  coverUrl?: string;
}