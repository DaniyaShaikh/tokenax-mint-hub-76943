import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Building, DollarSign, Coins, TrendingUp, MapPin, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PropertyDetailsDialogProps {
  propertyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PropertyDetailsDialog = ({ propertyId, open, onOpenChange }: PropertyDetailsDialogProps) => {
  const [property, setProperty] = useState<any>(null);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && propertyId) {
      loadPropertyDetails();
    }
  }, [open, propertyId]);

  const loadPropertyDetails = async () => {
    setLoading(true);
    try {
      const { data: propData } = await supabase
        .from("properties")
        .select("*, property_tokens(*)")
        .eq("id", propertyId)
        .single();

      const { data: purchaseData } = await supabase
        .from("token_purchases")
        .select("*, profiles(full_name, email)")
        .eq("property_id", propertyId)
        .order("purchased_at", { ascending: false });

      setProperty(propData);
      setPurchases(purchaseData || []);
    } catch (error) {
      console.error("Error loading property details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !property) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">Loading...</div>
        </DialogContent>
      </Dialog>
    );
  }

  const tokenData = property.property_tokens?.[0];
  const soldTokens = tokenData ? tokenData.total_tokens - tokenData.available_tokens : 0;
  const totalRevenue = soldTokens * (tokenData?.price_per_token || 0);
  const progressPercent = tokenData ? ((soldTokens / tokenData.total_tokens) * 100).toFixed(1) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{property.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Images */}
          {property.property_images && property.property_images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {property.property_images.slice(0, 4).map((img: string, idx: number) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Property ${idx + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              ))}
            </div>
          )}

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Coins className="h-4 w-4" />
                <span className="text-sm">Total Tokens</span>
              </div>
              <p className="text-2xl font-bold">{tokenData?.total_tokens.toLocaleString()}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Sold Tokens</span>
              </div>
              <p className="text-2xl font-bold">{soldTokens.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{progressPercent}% sold</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Coins className="h-4 w-4" />
                <span className="text-sm">Available</span>
              </div>
              <p className="text-2xl font-bold">{tokenData?.available_tokens.toLocaleString()}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Revenue</span>
              </div>
              <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
            </Card>
          </div>

          <Separator />

          {/* Property Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Property Information</h3>
            
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="font-medium">Address</p>
                <p className="text-sm text-muted-foreground">{property.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Building className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="font-medium">Type & Valuation</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {property.property_type} • ${property.valuation.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <DollarSign className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="font-medium">Price per Token</p>
                <p className="text-sm text-muted-foreground">${tokenData?.price_per_token}</p>
              </div>
            </div>

            {property.description && (
              <div>
                <p className="font-medium mb-1">Description</p>
                <p className="text-sm text-muted-foreground">{property.description}</p>
              </div>
            )}

            {property.highlights && (
              <div>
                <p className="font-medium mb-1">Highlights</p>
                <p className="text-sm text-muted-foreground">{property.highlights}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Recent Purchases */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Recent Purchases</h3>
            {purchases.length > 0 ? (
              <div className="space-y-2">
                {purchases.map((purchase) => (
                  <Card key={purchase.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{purchase.profiles?.full_name || "Anonymous"}</p>
                        <p className="text-xs text-muted-foreground">{purchase.profiles?.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{purchase.tokens_purchased} tokens</p>
                        <p className="text-xs text-muted-foreground">
                          ${purchase.total_amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(purchase.purchased_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No purchases yet</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
