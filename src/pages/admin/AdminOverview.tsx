import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Coins, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface DashboardStats {
  totalUsers: number;
  pendingKYC: number;
  pendingProperties: number;
  approvedProperties: number;
  tokenizedProperties: number;
  totalTokensSold: number;
  totalRevenue: number;
}

const AdminOverview = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    pendingKYC: 0,
    pendingProperties: 0,
    approvedProperties: 0,
    tokenizedProperties: 0,
    totalTokensSold: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [
        { count: totalUsers },
        { count: pendingKYC },
        { count: pendingProperties },
        { count: approvedProperties },
        { count: tokenizedProperties },
        { data: purchases },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("kyc_verifications").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("properties").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("properties").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("properties").select("*", { count: "exact", head: true }).eq("status", "tokenized"),
        supabase.from("token_purchases").select("tokens_purchased, total_amount"),
      ]);

      const totalTokensSold = purchases?.reduce((sum, p) => sum + Number(p.tokens_purchased), 0) || 0;
      const totalRevenue = purchases?.reduce((sum, p) => sum + Number(p.total_amount), 0) || 0;

      setStats({
        totalUsers: totalUsers || 0,
        pendingKYC: pendingKYC || 0,
        pendingProperties: pendingProperties || 0,
        approvedProperties: approvedProperties || 0,
        tokenizedProperties: tokenizedProperties || 0,
        totalTokensSold,
        totalRevenue,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Pending KYC/KYB",
      value: stats.pendingKYC,
      icon: AlertCircle,
      color: "text-warning",
      bgColor: "bg-warning/10",
      action: { label: "Review", href: "/admin/kyc" },
    },
    {
      title: "Pending Properties",
      value: stats.pendingProperties,
      icon: Building2,
      color: "text-warning",
      bgColor: "bg-warning/10",
      action: { label: "Review", href: "/admin/properties" },
    },
    {
      title: "Approved Properties",
      value: stats.approvedProperties,
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Tokenized Properties",
      value: stats.tokenizedProperties,
      icon: Coins,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Total Tokens Sold",
      value: stats.totalTokensSold.toLocaleString(),
      icon: TrendingUp,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-primary mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the Tokenax backoffice platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden group hover:shadow-accent transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/5 to-transparent rounded-full -mr-16 -mt-16" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                  <Icon className={cn("h-5 w-5", stat.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div className="text-3xl font-bold text-primary">{stat.value}</div>
                  {stat.action && (
                    <Link to={stat.action.href}>
                      <Button size="sm" variant="outline" className="group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                        {stat.action.label}
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Revenue Card */}
      <Card className="bg-gradient-to-br from-accent/5 via-card to-card border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Total Platform Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-bold text-accent mb-2">
            ${stats.totalRevenue.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground">From {stats.totalTokensSold.toLocaleString()} tokens sold across {stats.tokenizedProperties} properties</p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/admin/kyc">
            <Button className="w-full" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Review KYC/KYB
              {stats.pendingKYC > 0 && (
                <Badge variant="destructive" className="ml-2">{stats.pendingKYC}</Badge>
              )}
            </Button>
          </Link>
          <Link to="/admin/properties">
            <Button className="w-full" variant="outline">
              <Building2 className="h-4 w-4 mr-2" />
              Review Properties
              {stats.pendingProperties > 0 && (
                <Badge variant="destructive" className="ml-2">{stats.pendingProperties}</Badge>
              )}
            </Button>
          </Link>
          <Link to="/admin/tokens">
            <Button className="w-full" variant="outline">
              <Coins className="h-4 w-4 mr-2" />
              Manage Tokens
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

export default AdminOverview;
