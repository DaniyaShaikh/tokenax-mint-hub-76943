import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, XCircle, MapPin, DollarSign, Home, Eye, FileText, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  valuation: number;
  property_type: string;
  status: string;
  highlights: string;
  created_at: string;
  expected_tokens: number;
  admin_notes: string;
  profiles: {
    email: string;
    full_name: string;
  };
}

const PropertyEvaluation = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const { data } = await supabase
        .from("properties")
        .select(`
          *,
          profiles (email, full_name)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (data) {
        setProperties(data as any);
      }
    } catch (error) {
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: "approved" | "rejected") => {
    try {
      const updateData: any = {
        status: action,
        rejection_reason: action === "rejected" ? rejectionReasons[id] : null,
      };

      if (adminNotes[id]) {
        updateData.admin_notes = adminNotes[id];
      }

      const { error } = await supabase
        .from("properties")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      toast.success(`Property ${action}`);
      loadProperties();
      setRejectionReasons((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      setAdminNotes((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary">Property Evaluation</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve property listings for tokenization
        </p>
      </div>

      {/* Properties List */}
      <div className="grid grid-cols-1 gap-6">
        {properties.map((property) => (
          <Card key={property.id} className="hover:shadow-card transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Home className="h-5 w-5 text-accent" />
                    <CardTitle className="text-2xl">{property.title}</CardTitle>
                  </div>
                  <CardDescription className="space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{property.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="h-3 w-3" />
                      Submitted {new Date(property.created_at).toLocaleDateString()} by {property.profiles.email}
                    </div>
                  </CardDescription>
                </div>
                <Badge className="capitalize bg-primary text-primary-foreground">
                  {property.property_type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Property Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4" />
                    <span>Valuation</span>
                  </div>
                  <p className="text-2xl font-bold text-accent">
                    ${Number(property.valuation).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Expected Tokens</p>
                  <p className="text-2xl font-bold text-primary">
                    {property.expected_tokens?.toLocaleString() || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Owner</p>
                  <p className="font-medium text-primary">{property.profiles.full_name || "Unknown"}</p>
                </div>
              </div>

              {/* Description */}
              {property.description && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Description
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {property.description}
                  </p>
                </div>
              )}

              {/* Highlights */}
              {property.highlights && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">Highlights</h4>
                  <p className="text-sm text-muted-foreground">{property.highlights}</p>
                </div>
              )}

              {/* View Full Details */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    View Full Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{property.title}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Full Address</h4>
                      <p className="text-sm">{property.address}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Complete Description</h4>
                      <p className="text-sm whitespace-pre-wrap">{property.description}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Property Highlights</h4>
                      <p className="text-sm whitespace-pre-wrap">{property.highlights}</p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Admin Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary">Admin Notes (Internal)</label>
                <Textarea
                  placeholder="Add internal notes for this property..."
                  value={adminNotes[property.id] || ""}
                  onChange={(e) =>
                    setAdminNotes({ ...adminNotes, [property.id]: e.target.value })
                  }
                  className="min-h-[60px]"
                />
              </div>

              {/* Rejection Feedback */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary">
                  Feedback / Rejection Reason (Sent to Owner)
                </label>
                <Textarea
                  placeholder="Provide feedback or reason for rejection..."
                  value={rejectionReasons[property.id] || ""}
                  onChange={(e) =>
                    setRejectionReasons({ ...rejectionReasons, [property.id]: e.target.value })
                  }
                  className="min-h-[80px]"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="default"
                  onClick={() => handleAction(property.id, "approved")}
                  className="flex-1 bg-success hover:bg-success/90"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve for Tokenization
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleAction(property.id, "rejected")}
                  className="flex-1"
                  disabled={!rejectionReasons[property.id]}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject & Request Revision
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {properties.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground">No pending property evaluations at the moment.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PropertyEvaluation;
