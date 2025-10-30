import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, DollarSign, TrendingUp, Clock, Plus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PropertyListingDialog from "@/components/dashboard/PropertyListingDialog";
import { PropertyDetailsDialog } from "@/components/dashboard/PropertyDetailsDialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Property {
  id: string;
  title: string;
  status: string;
  valuation: number;
  property_images: any[];
  created_at: string;
  property_type: string;
}

interface Stats {
  totalProperties: number;
  pendingApproval: number;
  totalEarnings: number;
  activeSales: number;
}

const SellerDashboard = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalProperties: 0,
    pendingApproval: 0,
    totalEarnings: 0,
    activeSales: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showListingDialog, setShowListingDialog] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [earningsData, setEarningsData] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch properties
      const { data: propertiesData, error: propsError } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (propsError) throw propsError;

      setProperties((propertiesData || []) as Property[]);

      // Calculate stats
      const pending = propertiesData?.filter(p => p.status === "pending").length || 0;
      const tokenized = propertiesData?.filter(p => p.status === "tokenized").length || 0;

      // Fetch earnings from token purchases
      const { data: purchasesData, error: purchasesError } = await supabase
        .from("token_purchases")
        .select("total_amount, purchased_at, property_id")
        .in("property_id", propertiesData?.map(p => p.id) || []);

      if (!purchasesError && purchasesData) {
        const totalEarnings = purchasesData.reduce((sum, p) => sum + Number(p.total_amount), 0);
        
        // Generate earnings chart data (last 6 months)
        const monthlyEarnings = new Map();
        purchasesData.forEach(purchase => {
          const month = new Date(purchase.purchased_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          monthlyEarnings.set(month, (monthlyEarnings.get(month) || 0) + Number(purchase.total_amount));
        });

        const chartData = Array.from(monthlyEarnings.entries()).map(([month, amount]) => ({
          month,
          earnings: amount,
        }));

        setEarningsData(chartData);

        setStats({
          totalProperties: propertiesData?.length || 0,
          pendingApproval: pending,
          totalEarnings,
          activeSales: tokenized,
        });
      } else {
        setStats({
          totalProperties: propertiesData?.length || 0,
          pendingApproval: pending,
          totalEarnings: 0,
          activeSales: tokenized,
        });
      }

      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      tokenized: "default",
      pending: "secondary",
      rejected: "destructive",
      draft: "outline",
      approved: "default",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header with CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Seller Dashboard</h2>
          <p className="text-muted-foreground">Manage your properties and track earnings</p>
        </div>
        <Button onClick={() => setShowListingDialog(true)} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          List Property
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-normal text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Total Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProperties}</div>
            <p className="text-xs text-muted-foreground mt-1">Listed properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-normal text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingApproval}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-normal text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${stats.totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">From token sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-normal text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Active Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeSales}</div>
            <p className="text-xs text-muted-foreground mt-1">Properties selling</p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Chart */}
      {earningsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Earnings Overview</CardTitle>
            <CardDescription>Your monthly earnings from token sales</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Line type="monotone" dataKey="earnings" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Properties List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Properties</CardTitle>
          <CardDescription>All your listed properties with current status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading properties...</p>
          ) : properties.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No properties listed yet</p>
              <Button onClick={() => setShowListingDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                List Your First Property
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <Card key={property.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    {property.property_images?.[0] ? (
                      <img
                        src={property.property_images[0]}
                        alt={property.title}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Building2 className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold line-clamp-1">{property.title}</h3>
                      {getStatusBadge(property.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{property.property_type}</p>
                    <p className="text-sm font-medium mb-3">${Number(property.valuation).toLocaleString()}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setSelectedProperty(property.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <PropertyListingDialog
        open={showListingDialog}
        onOpenChange={setShowListingDialog}
        onSuccess={fetchDashboardData}
      />
      {selectedProperty && (
        <PropertyDetailsDialog
          propertyId={selectedProperty}
          open={!!selectedProperty}
          onOpenChange={(open) => !open && setSelectedProperty(null)}
        />
      )}
    </div>
  );
};

export default SellerDashboard;
