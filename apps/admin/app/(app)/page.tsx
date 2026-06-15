import { CheckCircle2, FileEdit, Stethoscope } from 'lucide-react';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getTenantContext } from '@/lib/tenant-db';

export default async function DashboardPage() {
  const { supabase, tenant, actor } = await getTenantContext();

  const head = { count: 'exact' as const, head: true };
  const [total, published, drafts] = await Promise.all([
    supabase.from('services').select('*', head).eq('tenant_id', tenant.id),
    supabase
      .from('services')
      .select('*', head)
      .eq('tenant_id', tenant.id)
      .eq('status', 'published'),
    supabase.from('services').select('*', head).eq('tenant_id', tenant.id).eq('status', 'draft'),
  ]);

  const stats = [
    { label: 'Hizmetler', value: total.count ?? 0, icon: Stethoscope },
    { label: 'Yayında', value: published.count ?? 0, icon: CheckCircle2 },
    { label: 'Taslak', value: drafts.count ?? 0, icon: FileEdit },
  ];

  return (
    <>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Hoş geldiniz</h1>
        <p className="text-sm text-muted-foreground">
          {tenant.name} · {actor.isSuperAdmin ? 'Süper yönetici' : 'Klinik kullanıcısı'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <CardDescription>{s.label}</CardDescription>
              <s.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-mono text-3xl font-semibold tabular-nums">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>İçerik yönetimi</CardTitle>
          <CardDescription>Kliniğinizin web sitesi içeriğini buradan yönetin.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Link href="/services" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Hizmetleri yönet
          </Link>
          <span className="text-sm text-muted-foreground">
            Blog, ekip, SSS, galeri ve diğer türler yakında.
          </span>
        </CardContent>
      </Card>
    </>
  );
}
