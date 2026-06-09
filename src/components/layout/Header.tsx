import { Bell, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { canAccess, getCurrentRole, getCurrentUser } from '@/lib/roles';

export function Header() {
  const navigate = useNavigate();

  const user = getCurrentUser();
  const role = getCurrentRole();

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/auth/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between gap-4 px-6">
        <SidebarTrigger className="-ml-2" />

        <div className="flex items-center gap-2">
          {/* <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
          </Button> */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-popover p-2">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-base">
                      {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground leading-tight">{user?.name || "Akun Saya"}</span>
                      <span className="text-xs text-muted-foreground capitalize font-medium">{user?.role ? user.role.replace('_', ' ') : "Role"}</span>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="-mx-2" />
                  <div className="space-y-1.5 text-xs pt-1">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground font-medium">Email</span>
                      <span className="text-foreground font-semibold truncate">{user?.email || "-"}</span>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* <DropdownMenuItem>Profil</DropdownMenuItem> */}
              {/* {canAccess('/settings', role) && (
                <DropdownMenuItem onClick={() => navigate('/settings')}>Pengaturan</DropdownMenuItem>
              )} */}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onClick={handleLogout}>Keluar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}