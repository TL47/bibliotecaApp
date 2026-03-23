import { Pipe, PipeTransform } from '@angular/core';
import { Libro } from './libros.model';

@Pipe({ name: 'libroFiltroAvanzado', standalone: true })
export class LibroFiltroAvanzadoPipe implements PipeTransform {
  transform(libros: Libro[], filtro: string): Libro[] {
    if (!filtro || filtro === 'all') return libros;
    if (filtro === 'reading') return libros.filter(l => l.rating === 6);
    if (filtro === 'pending') return libros.filter(l => l.rating === 7);
    if (filtro === 'completed') return libros.filter(l => l.rating > 0 && l.rating <= 5);
    return libros;
  }
}
