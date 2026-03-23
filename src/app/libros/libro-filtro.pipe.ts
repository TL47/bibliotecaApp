import { Pipe, PipeTransform } from '@angular/core';
import { Libro } from './libros.model';

@Pipe({ name: 'libroFiltro', standalone: true })
export class LibroFiltroPipe implements PipeTransform {
  transform(libros: Libro[], busqueda: string): Libro[] {
    if (!busqueda) return libros;
    const b = busqueda.toLowerCase();
    return libros.filter(l =>
      l.title.toLowerCase().includes(b) ||
      l.author.toLowerCase().includes(b)
    );
  }
}
