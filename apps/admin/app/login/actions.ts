'use server';

import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

export interface LoginState {
  error: string | null;
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const emailRaw = formData.get('email');
  const passwordRaw = formData.get('password');
  const email = typeof emailRaw === 'string' ? emailRaw.trim() : '';
  const password = typeof passwordRaw === 'string' ? passwordRaw : '';

  if (!email || !password) {
    return { error: 'E-posta ve şifre gerekli.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: 'Giriş başarısız. E-posta veya şifre hatalı.' };
  }

  // Session cookie is set; the proxy will allow the dashboard.
  redirect('/');
}
