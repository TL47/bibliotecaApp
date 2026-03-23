import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Libro, Saga } from './libros.model';

@Injectable({ providedIn: 'root' })
export class LibrosService {
  constructor(private supabase: SupabaseService) {}

  async getLibros(userId: string): Promise<Libro[]> {
    const { data, error } = await this.supabase.getBooks(userId);
    if (error) throw error;
    return data || [];
  }

  async getSagas(userId: string): Promise<Saga[]> {
    const { data, error } = await this.supabase.getSagas(userId);
    if (error) throw error;
    return data || [];
  }

  async addLibro(libro: Partial<Libro>, userId: string) {
    const { data, error } = await this.supabase.client
      .from('books')
      .insert([{ ...libro, user_id: userId }])
      .select();
    if (error) throw error;
    return data?.[0];
  }

  async updateLibro(libroId: number, libro: Partial<Libro>) {
    const { data, error } = await this.supabase.client
      .from('books')
      .update(libro)
      .eq('id', libroId)
      .select();
    if (error) throw error;
    return data?.[0];
  }

  async deleteLibro(libroId: number) {
    const { error } = await this.supabase.client
      .from('books')
      .delete()
      .eq('id', libroId);
    if (error) throw error;
    return true;
  }

  async addSaga(saga: Partial<Saga>, userId: string) {
    const { data, error } = await this.supabase.client
      .from('sagas')
      .insert([{ ...saga, user_id: userId }])
      .select();
    if (error) throw error;
    return data?.[0];
  }

  async updateSaga(sagaId: number, saga: Partial<Saga>) {
    const { data, error } = await this.supabase.client
      .from('sagas')
      .update(saga)
      .eq('id', sagaId)
      .select();
    if (error) throw error;
    return data?.[0];
  }

  async deleteSaga(sagaId: number) {
    const { error } = await this.supabase.client
      .from('sagas')
      .delete()
      .eq('id', sagaId);
    if (error) throw error;
    return true;
  }
}
