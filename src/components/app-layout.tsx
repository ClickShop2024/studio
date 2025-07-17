
"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, ShoppingBag, Tag, MessageSquare, Settings, User as UserIcon, LogIn, LogOut, Sun, Moon, Package, BarChart, DollarSign, Users, ShieldCheck, BadgePercent } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/components/theme-provider';

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const mainNavItems = [
    { href: '/', label: 'Home', icon: Home, roles: ['Customer'] },
    { href: '/categories', label: 'Categorías', icon: ShoppingBag, roles: ['Customer'] },
    { href: '/offers', label: 'Ofertas', icon: Tag, roles: ['Customer'] },
    { href: '/support', label: 'Soporte', icon: MessageSquare, roles: ['Customer'] },
  ];
  
  const adminNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: BarChart, roles: ['Administrator', 'Employee'] },
    { href: '/dashboard/inventory', label: 'Inventario', icon: Package, roles: ['Administrator', 'Employee'] },
    { href: '/dashboard/billing', label: 'Facturación', icon: DollarSign, roles: ['Administrator'] },
    { href: '/dashboard/offers', label: 'Ofertas', icon: BadgePercent, roles: ['Administrator'] },
    { href: '/dashboard/users', label: 'Usuarios', icon: Users, roles: ['Administrator'] },
  ];

  const getNavItems = () => {
    if (!isAuthenticated || !user) {
      return mainNavItems;
    }
    if (user.role === 'Administrator' || user.role === 'Employee') {
      return adminNavItems.filter(item => item.roles.includes(user.role));
    }
    return mainNavItems;
  }

  const navItems = getNavItems();

  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage) {
    return <main className="min-h-screen flex items-center justify-center p-4 bg-background">{children}</main>;
  }

  const getPageTitle = () => {
    // Combine all navigation items for title lookup
    const allNavItems = [
        ...mainNavItems,
        ...adminNavItems,
        // Add any other navigation items that are not in the sidebar but should have a title
        { href: '/settings', label: 'Configuración', icon: Settings, roles: ['Customer', 'Employee', 'Administrator'] },
    ];
    
    // Find a matching item for the current path
    const currentNavItem = allNavItems.find(item => pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/'));

    if (currentNavItem) {
        return currentNavItem.label;
    }
    
    // Fallback for dynamic routes or pages not in navigation
    if (pathname.startsWith('/dashboard')) {
        return 'Dashboard';
    }

    return 'Click Shop';
  }


  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <Link href="/" className="flex items-center gap-2.5">
                <ShieldCheck className="w-8 h-8 text-primary" />
                <span className="text-xl font-bold text-foreground">Click Shop</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <Link href={item.href} legacyBehavior passHref>
                    <SidebarMenuButton isActive={pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/')}>
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="flex items-center justify-between p-4 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <h2 className="text-xl font-semibold hidden md:block">{getPageTitle()}</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://api.dicebear.com/8.x/lorelei/svg?seed=${user.email}`} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground font-bold pt-1">{user.role}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configuración</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => router.push('/login')}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Iniciar Sesión
                </Button>
              )}
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
