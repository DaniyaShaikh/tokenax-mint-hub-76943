import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Building2, TrendingUp, Plus, Coins, DollarSign, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import { PropertyListingDialog } from "./PropertyListingDialog";
import { PropertyDetailsDialog } from "./PropertyDetailsDialog";
import KYCVerification from "./KYCVerification";

interface Property {
  id: string;
  title: string;
  status: string;
  valuation: number;
  rejection_reason?: string;
  property_tokens?: Array<{
    total_tokens: number;
    available_tokens: number;
    price_per_token: number;
  }>;
}

const SellerDashboard = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [listingDialogOpen, setListingDialogOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      const { data: kycData } = await supabase
        .from("kyc_verifications")
        .select("status")
        .eq("user_id", user.data.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setKycStatus(kycData?.status || null);

      const { data: propertiesData } = await supabase
        .from("properties")
        .select(`
          id, 
          title, 
          status, 
          valuation, 
          rejection_reason,
          property_tokens (
            total_tokens,
            available_tokens,
            price_per_token
          )
        `)
        .eq("owner_id", user.data.user.id)
        .order("created_at", { ascending: false });

      if (propertiesData && propertiesData.length > 0) {
        const mappedProperties = propertiesData.map((prop: any) => ({
          ...prop,
          property_tokens: prop.property_tokens ? [prop.property_tokens] : undefined
        }));
        setProperties(mappedProperties);
      } else {
        // Show sample data for new users
        const sampleProperties: Property[] = [
          {
            id: "sample-1",
            title: "Luxury Downtown Apartment",
            status: "tokenized",
            valuation: 850000,
            property_tokens: [{
              total_tokens: 10000,
              available_tokens: 3500,
              price_per_token: 85
            }]
          },
          {
            id: "sample-2",
            title: "Commercial Office Space",
            status: "pending",
            valuation: 1200000
          },
          {
            id: "sample-3",
            title: "Suburban Family Home",
            status: "draft",
            valuation: 450000
          }
        ];
        setProperties(sampleProperties);
      }
    } catch (error: any) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive"; icon: any }> = {
      draft: { variant: "secondary", icon: Clock },
      pending: { variant: "default", icon: Clock },
      approved: { variant: "default", icon: CheckCircle },
      rejected: { variant: "destructive", icon: XCircle },
      tokenized: { variant: "default", icon: CheckCircle },
    };
    const config = statusConfig[status] || { variant: "secondary", icon: Clock };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.replace("_", " ")}
      </Badge>
    );
  };

  if (loading) {
    return <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">Loading...</div>;
  }

  if (kycStatus !== "approved") {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <KYCVerification currentStatus={kycStatus} onStatusChange={() => loadData()} />
      </div>
    );
  }

  const totalProperties = properties.length;
  const tokenizedProperties = properties.filter(p => p.status === "tokenized").length;
  const pendingReview = properties.filter(p => p.status === "pending" || p.status === "draft").length;

  const totalTokensSold = properties.reduce((sum, p) => {
    if (p.property_tokens && p.property_tokens[0]) {
      const tokenData = p.property_tokens[0];
      return sum + (tokenData.total_tokens - tokenData.available_tokens);
    }
    return sum;
  }, 0);

  const totalRevenue = properties.reduce((sum, p) => {
    if (p.property_tokens && p.property_tokens[0]) {
      const tokenData = p.property_tokens[0];
      const soldTokens = tokenData.total_tokens - tokenData.available_tokens;
      return sum + (soldTokens * Number(tokenData.price_per_token));
    }
    return sum;
  }, 0);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Property Management</h2>
            <p className="text-muted-foreground">Manage and tokenize your real estate portfolio</p>
          </div>
          <Button onClick={() => setListingDialogOpen(true)} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            List New Property
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Properties</CardTitle>
            <Building2 className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalProperties}</div>
            <p className="text-xs text-muted-foreground mt-1">Properties listed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tokenized</CardTitle>
            <TrendingUp className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tokenizedProperties}</div>
            <p className="text-xs text-muted-foreground mt-1">Active on marketplace</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tokens Sold</CardTitle>
            <Coins className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTokensSold.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Total tokens sold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">From token sales</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Properties</CardTitle>
              <CardDescription>Manage and track your property listings</CardDescription>
            </div>
            {properties.length > 0 && <Badge variant="outline">{pendingReview} Pending Review</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          {properties.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No properties yet</h3>
              <p className="text-muted-foreground mb-6">Start by listing your first property for tokenization</p>
              <Button onClick={() => setListingDialogOpen(true)}>
                <Plus className="h-5 w-5 mr-2" />
                List Your First Property
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {properties.map((property) => {
                const tokenData = property.property_tokens?.[0];
                const tokensLeft = tokenData?.available_tokens || 0;
                const totalTokens = tokenData?.total_tokens || 0;
                const tokensSold = totalTokens - tokensLeft;
                const percentageSold = totalTokens > 0 ? (tokensSold / totalTokens) * 100 : 0;

                return (
                  <div key={property.id} className="p-6 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <Building2 className="h-12 w-12 text-accent flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-lg">{property.title}</h4>
                          <p className="text-sm text-muted-foreground">${Number(property.valuation).toLocaleString()} valuation</p>
                          {property.rejection_reason && (
                            <p className="text-xs text-destructive mt-1">Rejection: {property.rejection_reason}</p>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(property.status)}
                    </div>

                    {property.status === "tokenized" && tokenData && (
                      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Tokens Sold</p>
                            <p className="text-lg font-bold text-accent">{tokensSold.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Tokens Left</p>
                            <p className="text-lg font-bold">{tokensLeft.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Revenue</p>
                            <p className="text-lg font-bold">${(tokensSold * Number(tokenData.price_per_token)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Sales Progress</span>
                            <span>{percentageSold.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 bg-background rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${percentageSold}%` }} />
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full mt-2"
                          onClick={() => setSelectedPropertyId(property.id)}
                          disabled={property.id.startsWith('sample-')}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {property.id.startsWith('sample-') ? 'Sample Property' : 'View Details'}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <PropertyListingDialog open={listingDialogOpen} onOpenChange={setListingDialogOpen} onSuccess={loadData} />
      <PropertyDetailsDialog 
        propertyId={selectedPropertyId || ""} 
        open={!!selectedPropertyId} 
        onOpenChange={(open) => !open && setSelectedPropertyId(null)} 
      />
    </div>
  );
};

export default SellerDashboard;
