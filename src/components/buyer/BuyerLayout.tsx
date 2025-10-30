import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  ArrowLeftRight,
  User,
  Store,
  TrendingUp,
  Menu,
  X,
  RefreshCw,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import KYCVerification from "@/components/dashboard/KYCVerification";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const BuyerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [userMode, setUserMode] = useState<"buyer" | "seller">("buyer");
  const [userId, setUserId] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please log in to access the buyer portal");
        navigate("/auth");
        return;
      }

      setUserId(session.user.id);
      
      // Load user mode and KYC status from profile
      const [profileResult, kycResult] = await Promise.all([
        supabase.from("profiles").select("user_mode").eq("id", session.user.id).single(),
        supabase.from("kyc_verifications").select("status").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);
      
      if (profileResult.data) {
        setUserMode(profileResult.data.user_mode as "buyer" | "seller");
      }

      if (kycResult.data) {
        setKycStatus(kycResult.data.status);
      }
    } catch (error) {
      toast.error("Failed to verify access");
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const loadKYCStatus = async () => {
    if (!userId) return;
    
    const { data } = await supabase
      .from("kyc_verifications")
      .select("status")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (data) {
      setKycStatus(data.status);
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
      if (newMode === "seller") {
        navigate("/seller");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error("Failed to switch mode");
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error: any) {
      console.error("Error logging out:", error);
      toast.error("Failed to logout");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const isKYCApproved = kycStatus === "approved";

  // Show KYC verification if not approved
  if (!isKYCApproved) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6">
            <Alert variant="destructive" className="border-warning bg-warning/10">
              <AlertCircle className="h-4 w-4 text-warning" />
              <AlertTitle className="text-warning">KYC Verification Required</AlertTitle>
              <AlertDescription className="text-warning/90">
                Complete your KYC verification to unlock full access to the platform
              </AlertDescription>
            </Alert>
          </div>
          <KYCVerification 
            currentStatus={kycStatus || "not_started"} 
            onStatusChange={loadKYCStatus}
          />
        </div>
      </div>
    );
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Transactions", href: "/dashboard/transactions", icon: ArrowLeftRight },
    { name: "Accounts", href: "/dashboard/accounts", icon: User },
    { name: "Investments", href: "/dashboard/investments", icon: TrendingUp },
    { name: "Marketplace", href: "/dashboard/marketplace", icon: Store },
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
                    <Store className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold gradient-text">Buyer Portal</h2>
                    <p className="text-xs text-muted-foreground">Asset Management</p>
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
                <Link key={item.name} to={item.href}>
                  <div
                    className={cn(
                      "group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                      active
                        ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/25"
                        : "hover:bg-muted/80 text-foreground/70 hover:text-foreground"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 flex-shrink-0",
                      active && "text-white"
                    )} />
                    {sidebarOpen && (
                      <span className={cn(
                        "font-medium text-sm",
                        active && "text-white"
                      )}>
                        {item.name}
                      </span>
                    )}
                    {active && (
                      <div className="absolute right-0 w-1 h-8 bg-white rounded-l-full" />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Footer with Mode Toggle */}
          {sidebarOpen && (
            <div className="p-4 border-t border-border/50 space-y-3">
              <div className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl">
                <p className="text-xs font-semibold text-primary mb-1">Buyer Account</p>
                <p className="text-xs text-muted-foreground">Asset tokenization platform</p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={handleModeSwitch}
              >
                <RefreshCw className="h-4 w-4" />
                Switch to Seller Mode
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "transition-all duration-300 min-h-screen",
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

export default BuyerLayout;
