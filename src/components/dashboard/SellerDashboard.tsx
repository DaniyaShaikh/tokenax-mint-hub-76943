import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, DollarSign, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import KYCVerification from "./KYCVerification";

interface Property {
  id: string;
  title: string;
  status: string;
  valuation: number;
  rejection_reason?: string;
}

const SellerDashboard = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      // Check KYC status
      const { data: kycData } = await supabase
        .from("kyc_verifications")
        .select("status")
        .eq("user_id", user.data.user.id)
        .eq("verification_type", "kyc")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      setKycStatus(kycData?.status || null);

      // Load user properties
      const { data: propertiesData } = await supabase
        .from("properties")
        .select("id, title, status, valuation, rejection_reason")
        .eq("owner_id", user.data.user.id)
        .order("created_at", { ascending: false });

      if (propertiesData) {
        setProperties(propertiesData);
      }
    } catch (error: any) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      draft: "secondary",
      pending: "default",
      approved: "default",
      rejected: "destructive",
      tokenized: "default",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  // Show KYC verification if not approved
  if (kycStatus !== "approved") {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <KYCVerification currentStatus={kycStatus} onStatusChange={() => loadData()} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="bg-gradient-to-r from-primary to-accent p-8 rounded-2xl text-white">
        <h2 className="text-3xl font-bold mb-2">Property Management</h2>
        <p className="text-white/90">List and manage your real estate assets</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-card to-accent-light/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Properties</CardTitle>
            <Building2 className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{properties.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Listed properties</p>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-card to-accent-light/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tokenized</CardTitle>
            <DollarSign className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">
              {properties.filter((p) => p.status === "tokenized").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Live on marketplace</p>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-card to-accent-light/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
            <AlertCircle className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">
              {properties.filter((p) => p.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Properties List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">My Properties</h2>
            <p className="text-muted-foreground text-sm">Manage your listed properties</p>
          </div>
          <Button onClick={() => navigate("/list-property")} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            List New Property
          </Button>
        </div>

        <div className="grid gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="border-2 hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{property.title}</CardTitle>
                      {getStatusBadge(property.status)}
                    </div>
                    <CardDescription className="text-base">
                      <span className="font-semibold text-accent">${Number(property.valuation).toLocaleString()}</span> valuation
                    </CardDescription>
                  </div>
                  <Building2 className="h-8 w-8 text-muted-foreground/30" />
                </div>
              </CardHeader>
              {property.rejection_reason && (
                <CardContent>
                  <div className="bg-destructive/10 border-2 border-destructive/30 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-destructive">Rejection Reason:</p>
                        <p className="text-sm text-muted-foreground mt-1">{property.rejection_reason}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {properties.length === 0 && (
          <Card className="border-2 border-dashed border-border/50">
            <CardContent className="py-16 text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-accent/10 mb-4">
                <Building2 className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No properties listed yet</h3>
              <p className="text-muted-foreground mb-6">Get started by listing your first property for tokenization</p>
              <Button onClick={() => navigate("/list-property")} size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                List Your First Property
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;