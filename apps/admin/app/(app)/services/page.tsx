import { Plus } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { getTenantContext } from '@/lib/tenant-db';

import { ServiceRowActions } from './row-actions';

const LOCATION_LABELS: Record<string, string> = {
  'in-clinic': 'Klinikte',
  'home-call': 'Evde',
  both: 'Her ikisi',
};

export default async function ServicesPage() {
  const { supabase, tenant } = await getTenantContext();
  const { data: services } = await supabase
    .from('services')
    .select('id, title, slug, status, service_location, sort_order')
    .eq('tenant_id', tenant.id)
    .order('sort_order', { ascending: true });

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Hizmetler</h1>
          <p className="text-sm text-muted-foreground">{tenant.name}</p>
        </div>
        <Link href="/services/new" className={cn(buttonVariants({ size: 'sm' }), 'gap-1.5')}>
          <Plus className="size-4" />
          Yeni hizmet
        </Link>
      </div>

      {!services || services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <p className="text-sm text-muted-foreground">Henüz hizmet eklenmemiş.</p>
            <Link
              href="/services/new"
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              İlk hizmeti ekle
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Başlık</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Yer</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Link href={`/services/${s.id}`} className="font-medium hover:underline">
                      {s.title}
                    </Link>
                    <span className="ml-2 text-xs text-muted-foreground">/{s.slug}</span>
                  </TableCell>
                  <TableCell>
                    {s.status === 'published' ? (
                      <Badge>Yayında</Badge>
                    ) : (
                      <Badge variant="secondary">Taslak</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {LOCATION_LABELS[s.service_location] ?? s.service_location}
                  </TableCell>
                  <TableCell className="text-right">
                    <ServiceRowActions id={s.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </>
  );
}
