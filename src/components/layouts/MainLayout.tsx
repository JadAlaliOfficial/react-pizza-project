import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { ThemeToggle } from '../ui/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '../ui/sidebar';
import { useAuth } from '../../hooks/useAuth';
import {
  Home,
  Pizza,
  LogOut,
  Settings,
  Store,
  ChevronDown,
  Check,
  ScrollText,
  Shield,
  Users,

} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

// Static store data
const stores = [
  { id: 1, name: 'Downtown Store', address: '123 Main St' },
  { id: 2, name: 'Mall Location', address: '456 Shopping Center' },
  { id: 3, name: 'Westside Branch', address: '789 West Ave' },
  { id: 4, name: 'Airport Terminal', address: 'Airport Rd Terminal 2' },
  { id: 5, name: 'University Campus', address: '100 College St' },
];

// App Sidebar Component
function AppSidebar() {
  const location = useLocation();
  const [currentStore, setCurrentStore] = useState(stores[0]);
  const [open, setOpen] = useState(false);

  const menuItems = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: Home,
    },
    {
      title: 'Pizzas',
      url: '/pizza',
      icon: Pizza,
    },
    {
      title: 'Users', // New menu item
      url: '/users',
      icon: Users, // Add this import: import { Users } from 'lucide-react';
    },
    {
      title: 'Settings',
      url: '/settings',
      icon: Settings,
    },
  ];

  return (
    <Sidebar className="bg-sidebar  border-r border-sidebar-border">
      <SidebarHeader className="bg-sidebar">
        {/* Current Store Display */}
        <div className="px-2 sm:px-3 py-2 sm:py-3">
          <div className="flex items-center space-x-1 sm:space-x-2 mb-2 sm:mb-3">
            <Store className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-foreground truncate">
              {currentStore.name}
            </span>
          </div>

          {/* Store Selector Dropdown */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between h-8 md:h-10 text-xs p-1 sm:p-2 bg-sidebar border-sidebar-border hover:bg-sidebar-accent"
              >
                <div className="m-1 flex flex-col items-start min-w-0 flex-1">
                  <span className="font-medium text-xs truncate w-full text-left">
                    {currentStore.name}
                  </span>
                  <span className="text-muted-foreground text-xs truncate w-full text-left hidden sm:block">
                    {currentStore.address}
                  </span>
                </div>
                <ChevronDown className="ml-1 sm:ml-2 h-2 w-2 sm:h-3 sm:w-3 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] sm:w-[280px] p-0 bg-popover border-border">
              <Command className="bg-popover">
                <CommandInput
                  placeholder="Search stores..."
                  className="h-7 sm:h-8"
                />
                <CommandEmpty>No store found.</CommandEmpty>
                <CommandGroup>
                  <CommandList>
                    {stores.map((store) => (
                      <CommandItem
                        key={store.id}
                        value={`${store.name} ${store.address}`}
                        onSelect={() => {
                          setCurrentStore(store);
                          setOpen(false);
                        }}
                        className="flex items-center space-x-2 p-1.5 sm:p-2"
                      >
                        <Check
                          className={`mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 ${
                            currentStore.id === store.id
                              ? 'opacity-100'
                              : 'opacity-0'
                          }`}
                        />
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-medium text-xs sm:text-sm truncate">
                            {store.name}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {store.address}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandList>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 sm:px-3 text-xs sm:text-sm">
            Application
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    className="mx-1 sm:mx-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent"
                  >
                    <Link
                      to={item.url}
                      className="flex items-center space-x-2 sm:space-x-3"
                    >
                      <item.icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

// Helper function to generate breadcrumbs
function generateBreadcrumbs(pathname: string) {
  const pathSegments = pathname.split('/').filter(Boolean);

  const breadcrumbs = [
    { label: 'Home', href: '/dashboard', isActive: pathname === '/dashboard' },
  ];

  if (
    pathSegments.length > 1 ||
    (pathSegments.length === 1 && pathSegments[0] !== 'dashboard')
  ) {
    pathSegments.forEach((segment, index) => {
      if (segment === 'dashboard') return;

      const href = '/' + pathSegments.slice(0, index + 1).join('/');
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);
      const isActive = index === pathSegments.length - 1;

      breadcrumbs.push({ label, href, isActive });
    });
  }

  return breadcrumbs;
}

// App Header Component
function AppHeader() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const breadcrumbs = generateBreadcrumbs(location.pathname);

  if (!isAuthenticated || !user) {
    return (
      <header className="flex h-12 sm:h-16 shrink-0 items-center gap-1 sm:gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-border">
        <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4">
          <SidebarTrigger className="-ml-0.5 sm:-ml-1" />
        </div>
        <div className="ml-auto flex items-center gap-2 sm:gap-4 px-2 sm:px-4">
          <ThemeToggle />
        </div>
      </header>
    );
  }

  return (
    <header className="flex flex-col border-b border-border">
      {/* Top Header Row */}
      <div className="flex h-12 sm:h-16 shrink-0 items-center gap-1 sm:gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4">
          <SidebarTrigger className="-ml-0.5 sm:-ml-1" />
          <div className="flex flex-col">
            <h1 className="text-sm sm:text-lg font-medium sm:font-semibold text-foreground">
              Pizza Portal
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Management Dashboard
            </p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 sm:gap-4 px-2 sm:px-4">
          <ThemeToggle />
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-6 w-6 sm:h-8 sm:w-8 rounded-full"
                >
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                    <AvatarImage
                      // src={user?.avatar}
                      alt={user?.name || 'User'}
                    />
                    <AvatarFallback className="text-xs sm:text-sm">
                      {getInitials(user?.name || user?.email || 'User')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 sm:w-56"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs sm:text-sm font-medium leading-none">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate('/terms')}
                  className="text-xs sm:text-sm cursor-pointer"
                >
                  <ScrollText className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Terms of Service</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate('/privacy')}
                  className="text-xs sm:text-sm cursor-pointer"
                >
                  <Shield className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Privacy Policy</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-xs sm:text-sm"
                >
                  <LogOut className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Breadcrumbs Row */}
      <div className="flex items-center px-2 sm:px-4 py-1 sm:py-2 bg-muted/30">
        <Breadcrumb>
          <BreadcrumbList className="text-xs sm:text-sm">
            {breadcrumbs.map((breadcrumb, index) => (
              <React.Fragment key={breadcrumb.href}>
                <BreadcrumbItem>
                  {breadcrumb.isActive ? (
                    <BreadcrumbPage className="text-foreground font-medium text-xs sm:text-sm">
                      {breadcrumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      href={breadcrumb.href}
                      className="text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm"
                    >
                      {breadcrumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && (
                  <BreadcrumbSeparator className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}

// Main Layout Component
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />

        <main className="flex flex-1 flex-col gap-2 sm:gap-4 p-2 sm:p-4 pt-0 min-h-[100vh] rounded-lg bg-muted/50 md:min-h-min">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default MainLayout;
