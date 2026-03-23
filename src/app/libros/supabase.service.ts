import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xfrfgakawujgxcwckbdf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmcmZnYWthd3VqZ3hjd2NrYmRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDQyMTcsImV4cCI6MjA4NzAyMDIxN30.3lm_GCJYersZPfCw29kMQ4U6ZXC0WstNfPOlT46JlF0';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  get client() {
    return this.supabase;
  }

  async signUp(email: string, password: string) {
    return this.supabase.auth.signUp({ email, password });
  }

  async signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    return this.supabase.auth.signOut();
  }

  async getSession() {
    return this.supabase.auth.getSession();
  }

  async getBooks(userId: string) {
    return this.supabase
      .from('books')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  }

  async getSagas(userId: string) {
    return this.supabase
      .from('sagas')
      .select('*')
      .eq('user_id', userId)
      .order('order', { ascending: true });
  }

  // ...otros métodos de libros/sagas según sea necesario
}
