import { useState, useEffect, useRef, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  FolderOpen,
  BookOpen,
  ClipboardList,
  Blocks,
  FileEdit,
  Settings,
  HelpCircle,
  Activity,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { canAccess, getCurrentRole } from '@/lib/roles';

interface SubmenuItem {
  title: string;
  url: string;
}

interface MenuItem {
  title: string;
  url: string;
  icon: any;
  hasSubmenu?: boolean;
  submenuItems?: SubmenuItem[];
}

const menuItems: MenuItem[] = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Data Guru', url: '/teachers', icon: GraduationCap },
  {
    title: 'Data Murid',
    url: '/students',
    icon: Users,
    hasSubmenu: true,
    submenuItems: [
      { title: 'Kelas A', url: '/students?className=A' },
      { title: 'Kelas B', url: '/students?className=B' },
      { title: 'Kelas C', url: '/students?className=C' },
    ],
  },
  {
    title: 'Dokumen',
    url: '/documents',
    icon: FolderOpen,
    hasSubmenu: true,
    submenuItems: [
      { title: 'Administrasi', url: '/documents?category=Administrasi' },
      { title: 'Akademik', url: '/documents?category=Akademik' },
      { title: 'Keuangan', url: '/documents?category=Keuangan' },
      { title: 'Laporan', url: '/documents?category=Laporan' },
      { title: 'Sertifikat', url: '/documents?category=Sertifikat' },
      { title: 'Surat', url: '/documents?category=Surat' },
      { title: 'Dokumentasi', url: '/documents?category=Dokumentasi' },
      { title: 'Lainnya', url: '/documents?category=Lainnya' },
    ],
  },
  { title: 'Anekdot', url: '/anecdotes', icon: BookOpen },
  {
    title: 'Rapor Perkembangan',
    url: '/progress-reports',
    icon: ClipboardList,
    hasSubmenu: true,
    submenuItems: [
      { title: 'Kelas A', url: '/progress-reports?className=A' },
      { title: 'Kelas B', url: '/progress-reports?className=B' },
      { title: 'Kelas C', url: '/progress-reports?className=C' },
    ],
  },
  { title: 'Data APE', url: '/ape', icon: Blocks },
  { title: 'Template Rapor', url: '/report-templates', icon: FileEdit },
  { title: 'Soal', url: '/soal', icon: HelpCircle },
  { title: 'Log Aktivitas', url: '/activity-logs', icon: Activity },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === 'collapsed';
  const role = getCurrentRole();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium w-full'
      : 'hover:bg-sidebar-accent/50 w-full';

  const lastPathRef = useRef('');

  const visibleMenuItems = useMemo(() => {
    return menuItems.filter((item) => canAccess(item.url, role));
  }, [role]);

  useEffect(() => {
    const currentPath = location.pathname + location.search;
    if (lastPathRef.current !== currentPath) {
      lastPathRef.current = currentPath;
      
      const newOpenState = { ...openSubmenus };
      let changed = false;
      
      visibleMenuItems.forEach((item) => {
        if (item.hasSubmenu) {
          // Auto-expand if the active path matches any submenu item url
          const isSubActive = item.submenuItems?.some(
            (sub) => sub.url === currentPath || currentPath.startsWith(sub.url)
          );
          
          if (isSubActive && !openSubmenus[item.title]) {
            newOpenState[item.title] = true;
            changed = true;
          }
        }
      });
      
      if (changed) {
        setOpenSubmenus(newOpenState);
      }
    }
  }, [location.pathname, location.search, visibleMenuItems, openSubmenus]);

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-64'}>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-4">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-sidebar-foreground">SIMP</h2>
              <p className="text-xs text-sidebar-foreground/60">Sistem Informasi Manajemen Pendidikan</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4">Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenuItems.map((item) => {
                const hasSub = !!item.hasSubmenu;
                const isParentActive = location.pathname === item.url;
                const isSubmenuOpen = openSubmenus[item.title];

                return (
                  <div key={item.title} className="flex flex-col">
                    <SidebarMenuItem className="relative flex items-center w-full">
                      {hasSub ? (
                        <SidebarMenuButton
                          onClick={() => {
                            setOpenSubmenus((prev) => ({
                              ...prev,
                              [item.title]: !prev[item.title],
                            }));
                          }}
                          isActive={isParentActive}
                        >
                          <item.icon className="w-5 h-5" />
                          {!collapsed && <span>{item.title}</span>}
                          {!collapsed && (
                            <div className="ml-auto">
                              {isSubmenuOpen ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </div>
                          )}
                        </SidebarMenuButton>
                      ) : (
                        <SidebarMenuButton asChild isActive={isParentActive}>
                          <NavLink to={item.url} end>
                            <item.icon className="w-5 h-5" />
                            {!collapsed && <span>{item.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>

                    {item.hasSubmenu && isSubmenuOpen && !collapsed && (
                      <div className="pl-9 pr-2 py-1 flex flex-col gap-1 border-l border-sidebar-border ml-6 mt-1 max-h-[250px] overflow-y-auto custom-scrollbar">
                        {item.submenuItems?.map((subItem) => {
                          const currentFullUrl = location.pathname + location.search;
                          const isSubActive = currentFullUrl === subItem.url;
                          return (
                            <NavLink
                              key={subItem.title}
                              to={subItem.url}
                              className={`text-xs py-1.5 px-3 rounded-md transition-colors ${isSubActive
                                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/30'
                                }`}
                            >
                              {subItem.title}
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

