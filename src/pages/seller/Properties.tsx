import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Building2, Plus, Eye, CheckCircle, Clock, XCircle, FileText } from "lucide-react";
import PropertyListingDialog from "@/components/dashboard/PropertyListingDialog";
import { PropertyDetailsDialog } from "@/components/dashboard/PropertyDetailsDialog";

interface Property {
  id: string;
  title: string;
  status: string;
  valuation: number;
  property_images: any[];
  property_type: string;
  address: string;
  rejection_reason?: string;
}

const Properties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showListingDialog, setShowListingDialog] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProperties((data || []) as Property[]);
      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching properties:", error);
      toast.error("Failed to load properties");
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "tokenized":
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "draft":
        return <FileText className="h-5 w-5 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const renderPropertyCard = (property: Property) => (
    <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-[4/3] bg-muted relative">
        {property.property_images?.[0] ? (
          <img
            src={property.property_images[0]}
            alt={property.title}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-muted to-muted/50">
            <Building2 className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          {getStatusBadge(property.status)}
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold line-clamp-1 mb-2">{property.title}</h3>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <span className="capitalize">{property.property_type}</span>
          <span className="font-semibold text-foreground">${Number(property.valuation).toLocaleString()}</span>
        </div>
        {property.rejection_reason && (
          <p className="text-xs text-destructive mb-3 line-clamp-2 p-2 bg-destructive/10 rounded">
            {property.rejection_reason}
          </p>
        )}
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
  );

  const propertyGroups = {
    tokenized: properties.filter(p => p.status === "tokenized"),
    pending: properties.filter(p => p.status === "pending"),
    draft: properties.filter(p => p.status === "draft"),
    rejected: properties.filter(p => p.status === "rejected"),
  };

  return (
    <div className="space-y-6">
      {/* Header with CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Properties</h2>
          <p className="text-muted-foreground">Manage your property listings</p>
        </div>
        <Button onClick={() => setShowListingDialog(true)} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          List Property
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading properties...</p>
          </CardContent>
        </Card>
      ) : properties.length === 0 ? (
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No properties listed yet</h3>
            <p className="text-muted-foreground mb-4">Start by listing your first property</p>
            <Button onClick={() => setShowListingDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              List Your First Property
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Tokenized Properties */}
          {propertyGroups.tokenized.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <CardTitle>Tokenized Properties</CardTitle>
                    <Badge variant="default">{propertyGroups.tokenized.length}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {propertyGroups.tokenized.slice(0, 6).map(renderPropertyCard)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pending Properties */}
          {propertyGroups.pending.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <CardTitle>Pending Review</CardTitle>
                    <Badge variant="secondary">{propertyGroups.pending.length}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {propertyGroups.pending.slice(0, 4).map(renderPropertyCard)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Draft Properties */}
          {propertyGroups.draft.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <CardTitle>Draft Properties</CardTitle>
                    <Badge variant="outline">{propertyGroups.draft.length}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {propertyGroups.draft.slice(0, 4).map(renderPropertyCard)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rejected Properties */}
          {propertyGroups.rejected.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <CardTitle>Rejected Properties</CardTitle>
                    <Badge variant="destructive">{propertyGroups.rejected.length}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {propertyGroups.rejected.slice(0, 4).map(renderPropertyCard)}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Dialogs */}
      <PropertyListingDialog
        open={showListingDialog}
        onOpenChange={setShowListingDialog}
        onSuccess={fetchProperties}
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

export default Properties;
