import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import BuyerDashboard from "@/components/dashboard/BuyerDashboard";
import SellerDashboard from "@/components/dashboard/SellerDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import { toast } from "sonner";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userMode, setUserMode] = useState<"buyer" | "seller">("buyer");
  const [isAdmin, setIsAdmin] = useState(false);
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
      const [profileResult, roleResult] = await Promise.all([
        supabase.from("profiles").select("user_mode").eq("id", userId).single(),
        supabase.from("user_roles").select("role").eq("user_id", userId),
      ]);

      if (profileResult.data) {
        setUserMode(profileResult.data.user_mode as "buyer" | "seller");
      }

      if (roleResult.data) {
        setIsAdmin(roleResult.data.some((r) => r.role === "admin"));
      }
    } catch (error: any) {
      toast.error("Failed to load user data");
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        <DashboardHeader
          userMode={userMode}
          isAdmin={isAdmin}
          onModeSwitch={handleModeSwitch}
        />
        {isAdmin ? (
          <AdminDashboard />
        ) : userMode === "buyer" ? (
          <BuyerDashboard />
        ) : (
          <SellerDashboard />
        )}
      </main>
    </div>
  );
};

export default Dashboard;