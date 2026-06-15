import { PawPrint } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <PawPrint className="size-5" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-semibold">vetkit yönetim</h1>
            <p className="text-sm text-muted-foreground">Devam etmek için giriş yapın</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Giriş</CardTitle>
            <CardDescription>E-posta ve şifrenizle oturum açın.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
