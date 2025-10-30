import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Building, User, FileText, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface KYCVerification {
  id: string;
  user_id: string;
  verification_type: string;
  status: string;
  company_name?: string;
  created_at: string;
  profiles: {
    email: string;
    full_name?: string;
  };
}

const KYCReview = () => {
  const [verifications, setVerifications] = useState<KYCVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    loadVerifications();
  }, []);

  const loadVerifications = async () => {
    try {
      const { data } = await supabase
        .from("kyc_verifications")
        .select(`
          *,
          profiles (email, full_name)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (data) {
        setVerifications(data as any);
      }
    } catch (error) {
      toast.error("Failed to load verifications");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("kyc_verifications")
        .update({
          status: action,
          verified_at: action === "approved" ? new Date().toISOString() : null,
          rejection_reason: action === "rejected" ? rejectionReasons[id] : null,
        })
        .eq("id", id);

      if (error) throw error;

      toast.success(`Verification ${action}`);
      loadVerifications();
      setRejectionReasons((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleBulkApprove = async () => {
    try {
      const { error } = await supabase
        .from("kyc_verifications")
        .update({
          status: "approved",
          verified_at: new Date().toISOString(),
        })
        .in("id", selectedIds);

      if (error) throw error;

      toast.success(`${selectedIds.length} verifications approved`);
      setSelectedIds([]);
      loadVerifications();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">KYC / KYB Review</h1>
            <p className="text-white/90 text-lg">
              Review and verify user identity documents
            </p>
          </div>
          {selectedIds.length > 0 && (
            <Button 
              onClick={handleBulkApprove} 
              size="lg"
              className="bg-white text-primary hover:bg-white/90 shadow-lg rounded-full"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Bulk Approve ({selectedIds.length})
            </Button>
          )}
        </div>
      </div>

      {/* Verifications List */}
      <div className="space-y-4">
        {verifications.map((kyc) => {
          const isKYB = kyc.verification_type === "kyb";
          const isSelected = selectedIds.includes(kyc.id);

          return (
            <Card
              key={kyc.id}
              className={cn(
                "transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 border-2 hover:border-primary/30",
                isSelected && "ring-2 ring-primary border-primary/50"
              )}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelection(kyc.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {isKYB ? (
                          <Building className="h-4 w-4 text-accent" />
                        ) : (
                          <User className="h-4 w-4 text-accent" />
                        )}
                        <CardTitle className="text-xl">{kyc.profiles.email}</CardTitle>
                      </div>
                      <CardDescription className="flex flex-col gap-1">
                        <span>{kyc.profiles.full_name || "No name provided"}</span>
                        {kyc.company_name && (
                          <span className="font-medium text-primary">
                            Company: {kyc.company_name}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs">
                          <Calendar className="h-3 w-3" />
                          Submitted {new Date(kyc.created_at).toLocaleDateString()}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="px-4 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-semibold text-sm shadow-lg">
                    {kyc.verification_type.toUpperCase()}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                  <FileText className="h-4 w-4" />
                  <span>
                    {isKYB
                      ? "Business registration, tax documents, and director IDs pending review"
                      : "Government ID and proof of address pending review"}
                  </span>
                </div>

                <Textarea
                  placeholder="Add rejection reason (optional)..."
                  value={rejectionReasons[kyc.id] || ""}
                  onChange={(e) =>
                    setRejectionReasons({ ...rejectionReasons, [kyc.id]: e.target.value })
                  }
                  className="min-h-[80px]"
                />

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAction(kyc.id, "approved")}
                    className="flex-1 bg-gradient-to-r from-success to-success/80 hover:shadow-lg hover:shadow-success/25 rounded-full"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleAction(kyc.id, "rejected")}
                    className="flex-1 rounded-full"
                    disabled={!rejectionReasons[kyc.id]}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {verifications.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary mb-2">All Clear!</h3>
              <p className="text-muted-foreground">No pending KYC/KYB verifications at the moment.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

export default KYCReview;
