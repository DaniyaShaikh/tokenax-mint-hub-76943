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

  const COLORS = [
    "hsl(250, 75%, 60%)",  // primary
    "hsl(280, 70%, 55%)",  // secondary
    "hsl(145, 65%, 50%)",  // success
    "hsl(35, 100%, 55%)",  // warning
    "hsl(0, 75%, 55%)"     // destructive
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-secondary to-accent p-8 rounded-3xl">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
        <div className="relative">
          <h1 className="text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-white/90 text-lg">Platform performance and insights</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
            <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-xl">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold gradient-text">{data.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Active platform users</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-secondary/30 hover:shadow-xl hover:shadow-secondary/10 transition-all hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Properties
            </CardTitle>
            <div className="p-2 bg-gradient-to-br from-secondary to-accent rounded-xl">
              <Building2 className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold gradient-text">{data.totalProperties}</div>
            <p className="text-xs text-muted-foreground mt-1">Listed on platform</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-success/30 hover:shadow-xl hover:shadow-success/10 transition-all hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tokens Sold
            </CardTitle>
            <div className="p-2 bg-gradient-to-br from-success to-success/80 rounded-xl">
              <Coins className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-success">
              {data.totalTokensSold.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across all properties</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-accent/30 hover:shadow-xl hover:shadow-accent/10 transition-all hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <div className="p-2 bg-gradient-to-br from-accent to-primary rounded-xl">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold gradient-text">
              ${data.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Platform revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Approval Rates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 hover:border-success/30 hover:shadow-xl hover:shadow-success/10 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <div className="p-2 bg-gradient-to-br from-success to-success/80 rounded-xl">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              KYC Approval Rate
            </CardTitle>
            <CardDescription>Percentage of approved verifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-bold text-success mb-4">
              {data.kycApprovalRate.toFixed(1)}%
            </div>
            <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-success to-success/80 h-full transition-all duration-500 rounded-full"
                style={{ width: `${data.kycApprovalRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-xl">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              Property Approval Rate
            </CardTitle>
            <CardDescription>Percentage of approved properties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-bold gradient-text mb-4">
              {data.propertyApprovalRate.toFixed(1)}%
            </div>
            <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-500 rounded-full"
                style={{ width: `${data.propertyApprovalRate}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all">
          <CardHeader>
            <CardTitle className="text-2xl">Property Status Distribution</CardTitle>
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
                  outerRadius={100}
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

        <Card className="border-2 hover:border-secondary/30 hover:shadow-xl hover:shadow-secondary/10 transition-all">
          <CardHeader>
            <CardTitle className="text-2xl">Top Properties by Revenue</CardTitle>
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
                    borderRadius: "12px",
                  }}
                  formatter={(value: any) => [`$${value.toLocaleString()}`, "Revenue"]}
                />
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(250, 75%, 60%)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(280, 70%, 55%)" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <Bar dataKey="revenue" fill="url(#colorRevenue)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
