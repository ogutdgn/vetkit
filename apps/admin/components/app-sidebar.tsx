'use client';

import { LayoutDashboard, PawPrint, Stethoscope } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

const NAV = [
  { href: '/', label: 'Panel', icon: LayoutDashboard },
  { href: '/services', label: 'Hizmetler', icon: Stethoscope },
];

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-1 py-1.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <PawPrint className="size-4" />
          </div>
          <div className="grid leading-tight">
            <span className="text-sm font-semibold">vetkit</span>
            <span className="text-xs text-muted-foreground">yönetim</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>İçerik</SidebarGroupLabel>
          <SidebarMenu>
            {NAV.map((item) => {
              const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={active}
                    tooltip={item.label}
                    render={<Link href={item.href} />}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
