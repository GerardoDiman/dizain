import React, { useState } from 'react';
import { supabase } from '@lib/supabase';
import { LogIn, Loader2, AlertCircle } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('[LoginForm] Attempting login with:', email);
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('[LoginForm] Auth Error:', authError.message);
        throw authError;
      }

      if (data?.session) {
        console.log('[LoginForm] Login successful, setting cookie...');
        // Set session cookie for SSR/Middleware (7 days)
        document.cookie = `dz-admin-token=${data.session.access_token}; path=/; max-age=604800; SameSite=Lax`;
        console.log('[LoginForm] Cookie set. Redirecting...');

        // Successful login, maintain locale
        const pathParts = window.location.pathname.split('/');
        const lang = pathParts[1] || 'es';
        const target = `/${lang}/admin/dashboard`;
        console.log('[LoginForm] Target path:', target);
        window.location.href = target;
      } else {
        console.warn('[LoginForm] No session returned from Supabase');
      }

    } catch (err: any) {
      console.error('[LoginForm] Unexpected Error:', err);
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant p-10 relative z-10">
      {/* Decorative Technical Corners */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary -translate-x-1 -translate-y-1"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary translate-x-1 -translate-y-1"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary -translate-x-1 translate-y-1"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary translate-x-1 translate-y-1"></div>

      <div className="mb-10 text-center">
        <h2 className="font-headline text-3xl font-bold uppercase tracking-tight mb-2">Acceso Admin</h2>
        <p className="font-label text-xs text-secondary tracking-widest uppercase">The Blueprint Archive / Control Unit</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error-container text-on-error-container flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-xs font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2">
            Identificador (Email)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-surface-container-low border-b-2 border-outline focus:border-tertiary px-4 py-3 outline-none transition-colors font-body text-sm"
            placeholder="admin@dizain.app"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2">
            Clave de Acceso
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-surface-container-low border-b-2 border-outline focus:border-tertiary px-4 py-3 outline-none transition-colors font-body text-sm"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary-container text-on-primary font-headline py-4 px-6 transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span className="uppercase font-bold tracking-widest text-sm">Validar Credenciales</span>
              <LogIn className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>

      <div className="mt-12 flex items-center justify-between opacity-40">
        <div className="h-[1px] flex-1 bg-outline-variant"></div>
        <span className="mx-4 text-[9px] font-label uppercase tracking-[0.3em]">System v1.0.4</span>
        <div className="h-[1px] flex-1 bg-outline-variant"></div>
      </div>
    </div>
  );
}
