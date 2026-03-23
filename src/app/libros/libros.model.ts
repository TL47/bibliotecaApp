export interface Libro {
  id: number;
  title: string;
  author: string;
  cover: string;
  rating: number;
  readDate: string | null;
  isPending: boolean;
  opinion: string;
  sagaId?: number | null;
  fromSupabase?: boolean;
  order?: number;
}

export interface Saga {
  id: number;
  name: string;
  books: Libro[];
  order?: number;
  dirty?: boolean;
}
