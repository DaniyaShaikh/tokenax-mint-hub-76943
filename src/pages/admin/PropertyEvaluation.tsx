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
  property_images: string[];
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
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-secondary to-accent p-8 rounded-3xl">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
        <div className="relative">
          <h1 className="text-4xl font-bold text-white mb-2">Property Evaluation</h1>
          <p className="text-white/90 text-lg">
            Review and approve property listings for tokenization
          </p>
        </div>
      </div>

      {/* Properties List */}
      <div className="grid grid-cols-1 gap-6">
        {properties.map((property) => (
          <Card key={property.id} className="border-2 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
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
                <div className="px-4 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-semibold text-sm capitalize shadow-lg">
                  {property.property_type}
                </div>
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
                  <Button variant="outline" className="w-full" onClick={() => setSelectedProperty(property)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Full Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-3xl gradient-text">{property.title}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* Property Images */}
                    {property.property_images && property.property_images.length > 0 && (
                      <div className="grid grid-cols-2 gap-4">
                        {property.property_images.map((img, idx) => (
                          <div key={idx} className="relative aspect-video rounded-lg overflow-hidden">
                            <img
                              src={img}
                              alt={`${property.title} - Image ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-xl">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Valuation
                        </p>
                        <p className="text-2xl font-bold text-accent">
                          ${Number(property.valuation).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Property Type</p>
                        <p className="text-xl font-bold text-primary capitalize">
                          {property.property_type}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Expected Tokens</p>
                        <p className="text-xl font-bold text-secondary">
                          {property.expected_tokens?.toLocaleString() || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Submitted By</p>
                        <p className="text-lg font-medium text-foreground">
                          {property.profiles.full_name || "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">{property.profiles.email}</p>
                      </div>
                    </div>

                    {/* Full Address */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-lg text-primary flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Property Address
                      </h4>
                      <p className="text-base leading-relaxed p-4 bg-muted/30 rounded-lg">
                        {property.address}
                      </p>
                    </div>

                    {/* Complete Description */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-lg text-primary flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Property Description
                      </h4>
                      <p className="text-base leading-relaxed whitespace-pre-wrap p-4 bg-muted/30 rounded-lg">
                        {property.description}
                      </p>
                    </div>

                    {/* Property Highlights */}
                    {property.highlights && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-lg text-primary flex items-center gap-2">
                          <Home className="h-5 w-5" />
                          Key Highlights
                        </h4>
                        <p className="text-base leading-relaxed whitespace-pre-wrap p-4 bg-accent/5 rounded-lg">
                          {property.highlights}
                        </p>
                      </div>
                    )}

                    {/* Timeline */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-lg text-primary flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Submission Details
                      </h4>
                      <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Submitted On:</span>
                          <span className="font-medium">
                            {new Date(property.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="font-medium capitalize">{property.status}</span>
                        </div>
                      </div>
                    </div>

                    {/* Admin Notes if any */}
                    {property.admin_notes && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-lg text-primary">Admin Notes</h4>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
                          {property.admin_notes}
                        </p>
                      </div>
                    )}
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
                  onClick={() => handleAction(property.id, "approved")}
                  className="flex-1 bg-gradient-to-r from-success to-success/80 hover:shadow-lg hover:shadow-success/25 rounded-full text-white font-semibold"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve for Tokenization
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleAction(property.id, "rejected")}
                  className="flex-1 rounded-full font-semibold"
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
