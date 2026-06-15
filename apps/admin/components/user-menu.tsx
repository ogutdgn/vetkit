'use client';

import { LogOut } from 'lucide-react';

import { signOut } from '@/app/(app)/actions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function UserMenu({ name, isSuper }: { name: string; isSuper: boolean }) {
  const initials =
    name
      .split(' ')
      .map((s) => s.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'V';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-full" />}>
        <Avatar className="size-8">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate">{name}</span>
          <span className="text-xs font-normal text-muted-foreground">
            {isSuper ? 'Süper yönetici' : 'Klinik kullanıcısı'}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void signOut()}>
          <LogOut className="size-4" />
          Çıkış yap
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
