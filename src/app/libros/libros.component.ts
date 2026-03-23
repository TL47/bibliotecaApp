import { Component } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { LibrosService } from './libros.service';
import { Libro, Saga } from './libros.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LibroFiltroPipe } from './libro-filtro.pipe';
import { LibroFiltroAvanzadoPipe } from './libro-filtro-avanzado.pipe';

@Component({
  selector: 'app-libros',
  templateUrl: './libros.component.html',
  styleUrls: ['./libros.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, LibroFiltroPipe, LibroFiltroAvanzadoPipe]
})
export class LibrosComponent {
        // Métodos para autocompletar título
        buscarSugerenciasTitulo() {
          this.focusCampo = 'title';
          const q = this.nuevoLibro.title?.trim();
          if (!q || q.length < 2) {
            this.sugerenciasTitulo = [];
            return;
          }
          fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(q)}&maxResults=5`)
            .then(r => r.json())
            .then(data => {
              this.sugerenciasTitulo = (data.items || []).map((item: any) => ({
                title: item.volumeInfo.title,
                author: (item.volumeInfo.authors || []).join(', '),
                cover: item.volumeInfo.imageLinks?.thumbnail || ''
              }));
            });
        }

        seleccionarSugerenciaTitulo(sug: {title: string, author: string, cover: string}) {
          this.nuevoLibro.title = sug.title;
          this.nuevoLibro.author = sug.author;
          this.nuevoLibro.cover = sug.cover;
          this.sugerenciasTitulo = [];
          this.focusCampo = null;
        }

        onBlurCampo(campo: 'title' | 'author') {
          setTimeout(() => {
            if (campo === 'title') this.sugerenciasTitulo = [];
            if (campo === 'author') this.sugerenciasAutor = [];
            this.focusCampo = null;
          }, 200);
        }
    mostrarImportar = false;
    textoImportar = '';
    importarError = '';

    filtroActivo: 'all' | 'reading' | 'pending' | 'completed' = 'all';
    sagaVista: Saga | null = null;
    showAddSaga: boolean = false;
    addSagaLoading: boolean = false;
    addSagaError: string = '';
    nuevaSaga: Partial<Saga> = { name: '' };
    editandoSaga = false;
    sagaEditando: Partial<Saga> = {};
    editSagaLoading = false;
    editSagaError = '';
    editandoLibro = false;
    libroEditando: Partial<Libro> = {};
    editLibroLoading = false;
    editLibroError = '';
    busqueda = '';
    showAddBook = false;
    addLibroLoading = false;
    addLibroError = '';
    nuevoLibro: Partial<Libro> = { title: '', author: '', cover: '', rating: 0, readDate: '', opinion: '' };

    sugerenciasTitulo: Array<{title: string, author: string, cover: string}> = [];
    sugerenciasAutor: string[] = [];
    focusCampo: 'title' | 'author' | null = null;
    showLogin = true;
    isSigningUp = false;
    loading = false;
    errorMsg = '';
    user: any = null;
    libros: Libro[] = [];
    sagas: Saga[] = [];
    librosLoading = false;
    mostrarPassword = false;
    mantenerSesion = false;

    constructor(private supabase: SupabaseService, private librosService: LibrosService) {
      document.addEventListener('click', (e: any) => {
        if (!e.target.closest('.autocomplete-list')) {
          this.sugerenciasTitulo = [];
          this.sugerenciasAutor = [];
          this.focusCampo = null;
        }
      });
    }

    async copiarBiblioteca() {
      try {
        const data = {
          libros: this.libros,
          sagas: this.sagas.map(s => ({ ...s, books: undefined })),
        };
        await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        alert('Biblioteca copiada al portapapeles');
      } catch (e) {
        alert('Error al copiar');
      }
    }

    async importarBiblioteca() {
      this.importarError = '';
      try {
        const data = JSON.parse(this.textoImportar);
        if (!Array.isArray(data.libros)) throw new Error('Formato inválido');
        // Importar libros
        for (const libro of data.libros) {
          try {
            await this.librosService.addLibro(libro, this.user.id);
          } catch {}
        }
        // Importar sagas
        if (Array.isArray(data.sagas)) {
          for (const saga of data.sagas) {
            try {
              await this.librosService.addSaga(saga, this.user.id);
            } catch {}
          }
        }
        this.mostrarImportar = false;
        this.textoImportar = '';
        await this.cargarLibros();
        alert('Biblioteca importada');
      } catch (e: any) {
        this.importarError = e?.message || 'Error al importar';
      }
    }

    setFiltro(f: 'all' | 'reading' | 'pending' | 'completed') {
      this.filtroActivo = f;
    }

    verSaga(saga: Saga) {
      this.sagaVista = saga;
    }

    volverBiblioteca() {
      this.sagaVista = null;
    }

    addSaga = async () => {
      if (!this.user) return;
      this.addSagaLoading = true;
      this.addSagaError = '';
      try {
        await this.librosService.addSaga(this.nuevaSaga, this.user.id);
        this.showAddSaga = false;
        this.nuevaSaga = { name: '' };
        await this.cargarLibros();
      } catch (e: any) {
        this.addSagaError = e?.message || 'Error al guardar';
      } finally {
        this.addSagaLoading = false;
      }
    }

    async borrarSaga(sagaId: number) {
      if (!this.user) return;
      if (!confirm('¿Borrar esta saga y todos sus libros?')) return;
      try {
        await this.librosService.deleteSaga(sagaId);
        await this.cargarLibros();
      } catch (e: any) {
        alert(e?.message || 'Error al borrar saga');
      }
    }

    abrirEditarSaga(saga: Saga) {
      this.sagaEditando = { ...saga };
      this.editandoSaga = true;
      this.editSagaError = '';
    }

    cerrarEditarSaga() {
      this.editandoSaga = false;
      this.sagaEditando = {};
      this.editSagaError = '';
    }

    async guardarEdicionSaga() {
      if (!this.user || !this.sagaEditando.id) return;
      this.editSagaLoading = true;
      this.editSagaError = '';
      try {
        await this.librosService.updateSaga(this.sagaEditando.id, this.sagaEditando);
        this.cerrarEditarSaga();
        await this.cargarLibros();
      } catch (e: any) {
        this.editSagaError = e?.message || 'Error al guardar';
      } finally {
        this.editSagaLoading = false;
      }
    }

    abrirEditarLibro(libro: Libro) {
      this.libroEditando = { ...libro };
      this.editandoLibro = true;
      this.editLibroError = '';
    }

    cerrarEditarLibro() {
      this.editandoLibro = false;
      this.libroEditando = {};
      this.editLibroError = '';
    }

    async guardarEdicionLibro() {
      if (!this.user || !this.libroEditando.id) return;
      this.editLibroLoading = true;
      this.editLibroError = '';
      try {
        await this.librosService.updateLibro(this.libroEditando.id, this.libroEditando);
        this.cerrarEditarLibro();
        await this.cargarLibros();
      } catch (e: any) {
        this.editLibroError = e?.message || 'Error al guardar';
      } finally {
        this.editLibroLoading = false;
      }
    }

    async borrarLibro(libroId: number) {
      if (!this.user) return;
      if (!confirm('¿Borrar este libro?')) return;
      try {
        await this.librosService.deleteLibro(libroId);
        await this.cargarLibros();
      } catch (e: any) {
        alert(e?.message || 'Error al borrar libro');
      }
    }

    async addLibro() {
      if (!this.user) return;
      this.addLibroLoading = true;
      this.addLibroError = '';
      try {
        await this.librosService.addLibro(this.nuevoLibro, this.user.id);
        this.showAddBook = false;
        this.nuevoLibro = { title: '', author: '', cover: '', rating: 0, readDate: '', opinion: '' };
        await this.cargarLibros();
      } catch (e: any) {
        this.addLibroError = e?.message || 'Error al guardar';
      } finally {
        this.addLibroLoading = false;
      }
    }

    buscarSugerenciasAutor() {
      this.focusCampo = 'author';
      const q = this.nuevoLibro.author?.trim();
      if (!q || q.length < 2) {
        this.sugerenciasAutor = [];
        return;
      }
      fetch(`https://www.googleapis.com/books/v1/volumes?q=inauthor:${encodeURIComponent(q)}&maxResults=5`)
        .then(r => r.json())
        .then(data => {
          const autores = new Set<string>();
          (data.items || []).forEach((item: any) => {
            (item.volumeInfo.authors || []).forEach((a: string) => autores.add(a));
          });
          this.sugerenciasAutor = Array.from(autores);
        });
    }

    seleccionarSugerenciaAutor(sug: string) {
      this.nuevoLibro.author = sug;
      this.sugerenciasAutor = [];
      this.focusCampo = null;
    }

    buscarPortadaGoogleBooks() {
      const t = this.nuevoLibro.title?.trim();
      const a = this.nuevoLibro.author?.trim();
      if (!t) return;
      let q = `intitle:${t}`;
      if (a) q += `+inauthor:${a}`;
      fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=1`)
        .then(r => r.json())
        .then(data => {
          const item = (data.items && data.items[0]);
          if (item && item.volumeInfo.imageLinks) {
            this.nuevoLibro.cover = item.volumeInfo.imageLinks.thumbnail || item.volumeInfo.imageLinks.smallThumbnail || '';
          }
        });
    }

    async login(email: string, password: string) {
      this.loading = true;
      this.errorMsg = '';
      try {
        if (this.isSigningUp) {
          const { error } = await this.supabase.signUp(email, password);
          if (error) throw error;
          this.errorMsg = 'Cuenta creada. Revisa tu email para confirmar.';
        } else {
          const { data, error } = await this.supabase.signIn(email, password);
          if (error) throw error;
          this.user = data.session?.user;
          if (this.user) {
            this.showLogin = false;
            if (this.mantenerSesion && data.session) {
              localStorage.setItem('supabaseToken', data.session.access_token);
              localStorage.setItem('supabaseUser', JSON.stringify(data.session.user));
              localStorage.setItem('rememberSession', 'true');
            } else {
              localStorage.removeItem('supabaseToken');
              localStorage.removeItem('supabaseUser');
              localStorage.removeItem('rememberSession');
            }
            await this.cargarLibros();
          }
        }
      } catch (err: any) {
        this.errorMsg = err?.message || 'Error desconocido';
      } finally {
        this.loading = false;
      }
    }

    async logout() {
      await this.supabase.signOut();
      this.user = null;
      this.showLogin = true;
      this.isSigningUp = false;
      this.libros = [];
      this.sagas = [];
    }

    toggleAuthMode() {
      this.isSigningUp = !this.isSigningUp;
      this.errorMsg = '';
    }

    async ngOnInit() {
      // Mantener sesión si existe (localStorage)
      const rememberSession = localStorage.getItem('rememberSession');
      const cachedToken = localStorage.getItem('supabaseToken');
      const cachedUser = localStorage.getItem('supabaseUser');
      if (rememberSession && cachedToken && cachedUser) {
        this.user = JSON.parse(cachedUser);
        this.showLogin = false;
        this.mantenerSesion = true;
        await this.cargarLibros();
        return;
      }
      // Si no, usar sesión de Supabase
      const { data } = await this.supabase.getSession();
      if (data.session?.user) {
        this.user = data.session.user;
        this.showLogin = false;
        await this.cargarLibros();
      }
    }

    private async cargarLibros() {
      if (!this.user) return;
      this.librosLoading = true;
      try {
        this.libros = await this.librosService.getLibros(this.user.id);
        this.sagas = await this.librosService.getSagas(this.user.id);
      } catch (e) {
        // Manejo de error opcional
      } finally {
        this.librosLoading = false;
      }
    }

    // Getters para los contadores
    get librosLeyendo() {
      return (this.libros || []).filter(l => l.rating === 6);
    }
    get librosPendientes() {
      return (this.libros || []).filter(l => l.rating === 7);
    }
    get librosLeidos() {
      return (this.libros || []).filter(l => l.rating > 0 && l.rating <= 5);
    }
}
