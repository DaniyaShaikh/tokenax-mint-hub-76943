import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Building2,
  DollarSign,
  FileText,
  Menu,
  X,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SellerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [userMode, setUserMode] = useState<"buyer" | "seller">("seller");
  const [userId, setUserId] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please log in to access the seller portal");
        navigate("/auth");
        return;
      }

      setUserId(session.user.id);
      
      // Load user mode from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_mode")
        .eq("id", session.user.id)
        .single();
      
      if (profile) {
        setUserMode(profile.user_mode as "buyer" | "seller");
      }
    } catch (error) {
      toast.error("Failed to verify access");
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const handleModeSwitch = async () => {
    if (!userId) return;

    const newMode = userMode === "buyer" ? "seller" : "buyer";
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ user_mode: newMode })
        .eq("id", userId);

      if (error) throw error;

      setUserMode(newMode);
      toast.success(`Switched to ${newMode} mode`);
      
      // Navigate to the appropriate portal
      if (newMode === "buyer") {
        navigate("/dashboard");
      } else {
        navigate("/seller");
      }
    } catch (error: any) {
      toast.error("Failed to switch mode");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const navigation = [
    { name: "Dashboard", href: "/seller", icon: Home },
    { name: "Properties", href: "/seller/properties", icon: Building2 },
    { name: "Earnings", href: "/seller/earnings", icon: DollarSign },
    { name: "Documents", href: "/seller/documents", icon: FileText },
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-card/95 backdrop-blur-xl border-r border-border/50 shadow-xl transition-all duration-300",
          sidebarOpen ? "w-72" : "w-20"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Toggle */}
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center justify-between">
              {sidebarOpen && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-xl">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold gradient-text">Seller Portal</h2>
                    <p className="text-xs text-muted-foreground">Property Management</p>
                  </div>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hover:bg-muted rounded-xl"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    active
                      ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-5 w-5", !sidebarOpen && "mx-auto")} />
                  {sidebarOpen && (
                    <span className="font-medium">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer with Mode Toggle */}
          {sidebarOpen && (
            <div className="p-4 border-t border-border/50 space-y-3">
              <div className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl">
                <p className="text-xs font-semibold text-primary mb-1">Seller Account</p>
                <p className="text-xs text-muted-foreground">Property tokenization platform</p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={handleModeSwitch}
              >
                <RefreshCw className="h-4 w-4" />
                Switch to Buyer Mode
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "transition-all duration-300",
          sidebarOpen ? "ml-72" : "ml-20"
        )}
      >
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SellerLayout;
