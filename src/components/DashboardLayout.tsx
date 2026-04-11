import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Home, FileText, Bell, LogOut, Leaf, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/items", label: "Item Details", icon: FileText },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { signOut, user } = useAuth();

  const SidebarContent = () => (
    <>
      <div className="p-4 flex items-center gap-2">
        <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
          <Leaf className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <div className="font-bold text-sm text-sidebar-foreground">FreshSense</div>
          <div className="text-xs text-muted-foreground">Smart Monitor</div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-sidebar-border mt-auto">
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={signOut}>
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      {/* Mobile Header with Hamburger */}
      <header className="md:hidden flex flex-shrink-0 items-center justify-between p-4 border-b border-border bg-background sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <Leaf className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="font-bold text-foreground">FreshSense</div>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 flex flex-col bg-sidebar border-r-sidebar-border">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </header>

      {/* Sidebar for desktop */}
      <aside className="hidden md:flex w-56 border-r border-sidebar-border bg-sidebar flex-col shrink-0 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-4 md:p-6 w-full">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
