import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LibrosComponent } from './libros.component';
import { LibroFiltroPipe } from './libro-filtro.pipe';
import { LibroFiltroAvanzadoPipe } from './libro-filtro-avanzado.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LibrosComponent,
    LibroFiltroPipe,
    LibroFiltroAvanzadoPipe
  ]
})
export class LibrosModule {}
