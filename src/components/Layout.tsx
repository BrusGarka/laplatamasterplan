import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Shield, Settings, TrendingUp, Wallet, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

const menuItems = [
  {
    title: "Master Plan",
    url: "/master-plan",
    icon: TrendingUp,
  },
  {
    title: "Parâmetros",
    url: "/parametros",
    icon: Settings,
  },
  {
    title: "Investimentos",
    url: "/investimentos",
    icon: Wallet,
  },
  {
    title: "Premissas",
    url: "/premissas",
    icon: User,
  },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border">
            <div className="flex items-center gap-2 px-2 py-4">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">La Plata</span>
                <span className="text-xs text-muted-foreground">Master Plan</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navegação</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.url || 
                      (item.url === "/master-plan" && (location.pathname === "/" || location.pathname === "/master-plan"));
                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className={cn(
                            "w-full",
                            isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                          )}
                        >
                          <Link to={item.url}>
                            <Icon className="w-4 h-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1">
          <div className="flex h-14 items-center gap-4 border-b border-border px-4">
            <SidebarTrigger />
          </div>
          <div className="min-h-[calc(100vh-3.5rem)]">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
