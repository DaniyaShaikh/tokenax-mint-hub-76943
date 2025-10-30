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
        <div className="absolute top-2 right-2">
          {getStatusBadge(property.status)}
        </div>
      </div>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold line-clamp-1">{property.title}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-1">{property.property_type}</p>
        <p className="text-sm text-muted-foreground mb-1 line-clamp-1">{property.address}</p>
        <p className="text-sm font-medium mb-3">${Number(property.valuation).toLocaleString()}</p>
        {property.rejection_reason && (
          <p className="text-xs text-destructive mb-3 line-clamp-2">
            Reason: {property.rejection_reason}
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
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <h3 className="text-xl font-semibold">Tokenized Properties</h3>
                <Badge variant="default">{propertyGroups.tokenized.length}</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {propertyGroups.tokenized.map(renderPropertyCard)}
              </div>
            </div>
          )}

          {/* Pending Properties */}
          {propertyGroups.pending.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <h3 className="text-xl font-semibold">Pending Review</h3>
                <Badge variant="secondary">{propertyGroups.pending.length}</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {propertyGroups.pending.map(renderPropertyCard)}
              </div>
            </div>
          )}

          {/* Draft Properties */}
          {propertyGroups.draft.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-xl font-semibold">Draft Properties</h3>
                <Badge variant="outline">{propertyGroups.draft.length}</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {propertyGroups.draft.map(renderPropertyCard)}
              </div>
            </div>
          )}

          {/* Rejected Properties */}
          {propertyGroups.rejected.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <h3 className="text-xl font-semibold">Rejected Properties</h3>
                <Badge variant="destructive">{propertyGroups.rejected.length}</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {propertyGroups.rejected.map(renderPropertyCard)}
              </div>
            </div>
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
