import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">vetkit yönetim</h1>
        <p className="mb-6 mt-1 text-sm text-slate-500">Devam etmek için giriş yapın.</p>
        <LoginForm />
      </div>
    </main>
  );
}
