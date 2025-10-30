import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import BuyerDashboard from "@/components/dashboard/BuyerDashboard";
import SellerDashboard from "@/components/dashboard/SellerDashboard";
import KYCVerification from "@/components/dashboard/KYCVerification";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userMode, setUserMode] = useState<"buyer" | "seller">("buyer");
  const [isAdmin, setIsAdmin] = useState(false);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      } else {
        loadUserData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadUserData = async (userId: string) => {
    try {
      const [profileResult, roleResult, kycResult] = await Promise.all([
        supabase.from("profiles").select("user_mode").eq("id", userId).single(),
        supabase.from("user_roles").select("role").eq("user_id", userId),
        supabase.from("kyc_verifications").select("status").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).single(),
      ]);

      if (profileResult.data) {
        setUserMode(profileResult.data.user_mode as "buyer" | "seller");
      }

      if (kycResult.data) {
        setKycStatus(kycResult.data.status);
      }

      if (roleResult.data) {
        const isAdminUser = roleResult.data.some((r) => r.role === "admin");
        setIsAdmin(isAdminUser);
        
        // Redirect admins to the admin portal
        if (isAdminUser) {
          navigate("/admin");
          return;
        }
      }
    } catch (error: any) {
      // KYC not found is okay, user just hasn't started verification
      console.log("Loading user data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModeSwitch = async (mode: "buyer" | "seller") => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ user_mode: mode })
        .eq("id", user.id);

      if (error) throw error;

      setUserMode(mode);
      toast.success(`Switched to ${mode} mode`);
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

  const isKYCApproved = kycStatus === "approved";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        {!isKYCApproved && (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Alert variant="destructive" className="border-warning bg-warning/10">
              <AlertCircle className="h-4 w-4 text-warning" />
              <AlertTitle className="text-warning">KYC Verification Required</AlertTitle>
              <AlertDescription className="text-warning/90">
                Complete your KYC verification to unlock full access to the platform
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        {isKYCApproved ? (
          <>
            <DashboardHeader
              userMode={userMode}
              isAdmin={isAdmin}
              onModeSwitch={handleModeSwitch}
            />
            {userMode === "buyer" ? (
              <BuyerDashboard />
            ) : (
              <SellerDashboard />
            )}
          </>
        ) : (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <KYCVerification 
              currentStatus={kycStatus} 
              onStatusChange={() => loadUserData(user?.id || "")}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;