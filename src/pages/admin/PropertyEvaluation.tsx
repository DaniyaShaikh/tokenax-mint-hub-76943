import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, MapPin, DollarSign, Home, Eye, FileText, Calendar, User } from "lucide-react";
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

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Card key={property.id} className="border-2 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all hover:-translate-y-1 overflow-hidden group">
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-accent/20 to-accent/5">
              {property.property_images && property.property_images.length > 0 ? (
                <img
                  src={property.property_images[0]}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Home className="h-16 w-16 text-accent/40" />
                </div>
              )}
              <div className="absolute top-3 right-3">
                <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-xs font-semibold capitalize shadow-lg backdrop-blur-sm">
                  {property.property_type}
                </div>
              </div>
            </div>
            
            <CardHeader className="pb-3">
              <CardTitle className="text-lg line-clamp-2">{property.title}</CardTitle>
              <CardDescription className="flex items-start gap-1 text-xs">
                <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{property.address}</span>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-3 pt-0">
              <div className="flex items-baseline justify-between p-3 bg-accent/5 rounded-lg">
                <span className="text-xs text-muted-foreground">Valuation</span>
                <span className="text-lg font-bold text-accent">
                  ${(Number(property.valuation) / 1000000).toFixed(1)}M
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Expected Tokens</span>
                <span className="font-semibold">{property.expected_tokens?.toLocaleString() || "TBD"}</span>
              </div>
              
              <div className="flex items-center gap-1 text-xs text-muted-foreground border-t pt-3">
                <Calendar className="h-3 w-3" />
                <span>{new Date(property.created_at).toLocaleDateString()}</span>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setSelectedProperty(property)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details & Review
              </Button>
            </CardContent>
          </Card>
        ))}

        {properties.length === 0 && (
          <div className="col-span-full">
            <Card>
              <CardContent className="py-16 text-center">
                <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-primary mb-2">All Caught Up!</h3>
                <p className="text-muted-foreground">No pending property evaluations at the moment.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Property Details & Review Dialog */}
      <Dialog open={!!selectedProperty} onOpenChange={(open) => !open && setSelectedProperty(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {selectedProperty && (
            <>
              <DialogHeader>
                <DialogTitle className="text-3xl gradient-text pr-8">{selectedProperty.title}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Property Images Gallery */}
                {selectedProperty.property_images && selectedProperty.property_images.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg text-primary flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Property Images
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedProperty.property_images.map((img, idx) => (
                        <div key={idx} className="relative aspect-video rounded-xl overflow-hidden shadow-lg border-2 border-border hover:border-primary/50 transition-all cursor-pointer">
                          <img
                            src={img}
                            alt={`${selectedProperty.title} - Image ${idx + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                            <p className="text-white text-sm font-medium">Image {idx + 1}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-xl border-2 border-primary/10">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Property Valuation
                    </p>
                    <p className="text-2xl font-bold text-accent">
                      ${Number(selectedProperty.valuation).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Property Type</p>
                    <p className="text-xl font-bold text-primary capitalize">
                      {selectedProperty.property_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Expected Tokens</p>
                    <p className="text-xl font-bold text-secondary">
                      {selectedProperty.expected_tokens?.toLocaleString() || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Token Value</p>
                    <p className="text-xl font-bold text-accent">
                      ${selectedProperty.expected_tokens ? (Number(selectedProperty.valuation) / selectedProperty.expected_tokens).toFixed(2) : "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground">per token</p>
                  </div>
                </div>

                {/* Owner Information */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg text-primary flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Property Owner
                  </h4>
                  <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{selectedProperty.profiles.full_name || "Not provided"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{selectedProperty.profiles.email}</span>
                    </div>
                  </div>
                </div>

                {/* Full Address */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg text-primary flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Property Address
                  </h4>
                  <p className="text-base leading-relaxed p-4 bg-muted/30 rounded-lg">
                    {selectedProperty.address}
                  </p>
                </div>

                {/* Complete Description */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg text-primary flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Property Description
                  </h4>
                  <p className="text-base leading-relaxed whitespace-pre-wrap p-4 bg-muted/30 rounded-lg">
                    {selectedProperty.description}
                  </p>
                </div>

                {/* Property Highlights */}
                {selectedProperty.highlights && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-lg text-primary flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      Key Highlights
                    </h4>
                    <p className="text-base leading-relaxed whitespace-pre-wrap p-4 bg-accent/5 rounded-lg">
                      {selectedProperty.highlights}
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
                        {new Date(selectedProperty.created_at).toLocaleDateString('en-US', {
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
                      <span className="font-medium capitalize">{selectedProperty.status}</span>
                    </div>
                  </div>
                </div>

                {/* Admin Review Section */}
                <div className="border-t-2 pt-6 space-y-4">
                  <h4 className="font-semibold text-xl text-primary">Admin Review</h4>
                  
                  {/* Admin Notes */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-primary">Internal Notes (Not visible to owner)</label>
                    <Textarea
                      placeholder="Add internal notes for this property..."
                      value={adminNotes[selectedProperty.id] || ""}
                      onChange={(e) =>
                        setAdminNotes({ ...adminNotes, [selectedProperty.id]: e.target.value })
                      }
                      className="min-h-[80px]"
                    />
                  </div>

                  {/* Rejection Feedback */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-primary">
                      Feedback / Rejection Reason (Will be sent to owner)
                    </label>
                    <Textarea
                      placeholder="Provide feedback or reason for rejection..."
                      value={rejectionReasons[selectedProperty.id] || ""}
                      onChange={(e) =>
                        setRejectionReasons({ ...rejectionReasons, [selectedProperty.id]: e.target.value })
                      }
                      className="min-h-[100px]"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => {
                        handleAction(selectedProperty.id, "approved");
                        setSelectedProperty(null);
                      }}
                      className="flex-1 bg-success hover:bg-success/90 text-white hover:shadow-lg hover:shadow-success/25 rounded-full font-semibold h-12 text-base"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Approve for Tokenization
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleAction(selectedProperty.id, "rejected");
                        setSelectedProperty(null);
                      }}
                      className="flex-1 rounded-full font-semibold h-12 text-base"
                      disabled={!rejectionReasons[selectedProperty.id]}
                    >
                      <XCircle className="h-5 w-5 mr-2" />
                      Reject & Request Revision
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyEvaluation;
