export interface BookCopyDetails {
  inventoryCode: string;
  status: 'AVAILABLE' | 'LOANED' | 'RESERVED' | 'REMOVED';
  book?: null;
}

export interface BookDetails {
  id: number;
  title: string;
  author: string;
  description: string;
  genre: string;
  publisher: string;
  isbn: string;
  year: string;
  coverUrl: string;
  copies: BookCopyDetails[];
}
