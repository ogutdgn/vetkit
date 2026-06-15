'use client';

import { Check, ChevronsUpDown } from 'lucide-react';

import { setActiveTenant } from '@/app/(app)/actions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { TenantRef } from '@/lib/auth';

export function TenantSwitcher({
  tenants,
  active,
  isSuper,
}: {
  tenants: TenantRef[];
  active: TenantRef | null;
  isSuper: boolean;
}) {
  if (tenants.length <= 1 && !isSuper) {
    return active ? (
      <span className="text-sm font-medium text-muted-foreground">{active.name}</span>
    ) : null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="gap-2" />}>
        <span className="max-w-36 truncate">{active?.name ?? 'Klinik seç'}</span>
        <ChevronsUpDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{isSuper ? 'Tüm klinikler' : 'Klinikleriniz'}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {tenants.map((t) => (
          <DropdownMenuItem key={t.id} onClick={() => void setActiveTenant(t.id)}>
            <span className="flex-1 truncate">{t.name}</span>
            {t.id === active?.id ? <Check className="size-4" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
