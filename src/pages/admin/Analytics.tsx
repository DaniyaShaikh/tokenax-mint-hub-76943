import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Building2, Coins, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

interface AnalyticsData {
  totalUsers: number;
  totalProperties: number;
  totalTokensSold: number;
  totalRevenue: number;
  kycApprovalRate: number;
  propertyApprovalRate: number;
  propertyStatusData: Array<{ name: string; value: number }>;
  revenueByProperty: Array<{ name: string; revenue: number }>;
}

const Analytics = () => {
  const [data, setData] = useState<AnalyticsData>({
    totalUsers: 0,
    totalProperties: 0,
    totalTokensSold: 0,
    totalRevenue: 0,
    kycApprovalRate: 0,
    propertyApprovalRate: 0,
    propertyStatusData: [],
    revenueByProperty: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [
        { count: totalUsers },
        { data: properties },
        { data: kycs },
        { data: purchases },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("properties").select("id, title, status"),
        supabase.from("kyc_verifications").select("status"),
        supabase.from("token_purchases").select(`
          tokens_purchased,
          total_amount,
          properties (title)
        `),
      ]);

      const totalTokensSold = purchases?.reduce((sum, p) => sum + Number(p.tokens_purchased), 0) || 0;
      const totalRevenue = purchases?.reduce((sum, p) => sum + Number(p.total_amount), 0) || 0;

      // KYC approval rate
      const approvedKYC = kycs?.filter((k) => k.status === "approved").length || 0;
      const totalKYC = kycs?.length || 1;
      const kycApprovalRate = (approvedKYC / totalKYC) * 100;

      // Property approval rate
      const approvedProperties = properties?.filter((p) => p.status === "approved" || p.status === "tokenized").length || 0;
      const totalProperties = properties?.length || 1;
      const propertyApprovalRate = (approvedProperties / totalProperties) * 100;

      // Property status distribution
      const statusCounts: Record<string, number> = {};
      properties?.forEach((p) => {
        statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
      });
      const propertyStatusData = Object.entries(statusCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));

      // Revenue by property
      const revenueMap: Record<string, number> = {};
      purchases?.forEach((p: any) => {
        const title = p.properties?.title || "Unknown";
        revenueMap[title] = (revenueMap[title] || 0) + Number(p.total_amount);
      });
      const revenueByProperty = Object.entries(revenueMap)
        .map(([name, revenue]) => ({ name, revenue }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setData({
        totalUsers: totalUsers || 0,
        totalProperties: properties?.length || 0,
        totalTokensSold,
        totalRevenue,
        kycApprovalRate,
        propertyApprovalRate,
        propertyStatusData,
        revenueByProperty,
      });
    } catch (error) {
      console.error("Failed to load analytics:", error);
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

  const COLORS = ["hsl(195, 100%, 50%)", "hsl(218, 65%, 14%)", "hsl(142, 76%, 36%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)"];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform performance and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-accent/10 to-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
            <Users className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{data.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Active platform users</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Properties
            </CardTitle>
            <Building2 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{data.totalProperties}</div>
            <p className="text-xs text-muted-foreground mt-1">Listed on platform</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tokens Sold
            </CardTitle>
            <Coins className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {data.totalTokensSold.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across all properties</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">
              ${data.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Platform revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Approval Rates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              KYC Approval Rate
            </CardTitle>
            <CardDescription>Percentage of approved verifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-success mb-2">
              {data.kycApprovalRate.toFixed(1)}%
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="bg-success h-full transition-all duration-500"
                style={{ width: `${data.kycApprovalRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Property Approval Rate
            </CardTitle>
            <CardDescription>Percentage of approved properties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-accent mb-2">
              {data.propertyApprovalRate.toFixed(1)}%
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="bg-accent h-full transition-all duration-500"
                style={{ width: `${data.propertyApprovalRate}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Property Status Distribution</CardTitle>
            <CardDescription>Breakdown of property statuses</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.propertyStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.propertyStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Properties by Revenue</CardTitle>
            <CardDescription>Highest earning properties</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.revenueByProperty}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: any) => [`$${value.toLocaleString()}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="hsl(195, 100%, 50%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
