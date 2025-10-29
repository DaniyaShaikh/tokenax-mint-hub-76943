import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Building2, Users } from "lucide-react";
import { toast } from "sonner";

interface KYCVerification {
  id: string;
  user_id: string;
  verification_type: string;
  status: string;
  company_name?: string;
  profiles: {
    email: string;
    full_name?: string;
  };
}

interface Property {
  id: string;
  title: string;
  address: string;
  valuation: number;
  property_type: string;
  status: string;
  profiles: {
    email: string;
  };
}

const AdminDashboard = () => {
  const [kycRequests, setKycRequests] = useState<KYCVerification[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load pending KYC verifications
      const { data: kycData } = await supabase
        .from("kyc_verifications")
        .select(`
          *,
          profiles (email, full_name)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (kycData) {
        setKycRequests(kycData as any);
      }

      // Load pending properties
      const { data: propertiesData } = await supabase
        .from("properties")
        .select(`
          *,
          profiles (email)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (propertiesData) {
        setProperties(propertiesData as any);
      }
    } catch (error: any) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleKYCAction = async (id: string, action: "approved" | "rejected") => {
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
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handlePropertyAction = async (id: string, action: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("properties")
        .update({
          status: action,
          rejection_reason: action === "rejected" ? rejectionReasons[id] : null,
        })
        .eq("id", id);

      if (error) throw error;

      toast.success(`Property ${action}`);
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <Tabs defaultValue="kyc" className="space-y-8">
        <TabsList>
          <TabsTrigger value="kyc">
            <Users className="h-4 w-4 mr-2" />
            KYC Verifications ({kycRequests.length})
          </TabsTrigger>
          <TabsTrigger value="properties">
            <Building2 className="h-4 w-4 mr-2" />
            Property Reviews ({properties.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kyc" className="space-y-4">
          {kycRequests.map((kyc) => (
            <Card key={kyc.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{kyc.profiles.email}</CardTitle>
                    <CardDescription>
                      {kyc.profiles.full_name || "No name provided"}
                      {kyc.company_name && ` - ${kyc.company_name}`}
                    </CardDescription>
                  </div>
                  <Badge>{kyc.verification_type.toUpperCase()}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Rejection reason (if rejecting)..."
                  value={rejectionReasons[kyc.id] || ""}
                  onChange={(e) =>
                    setRejectionReasons({ ...rejectionReasons, [kyc.id]: e.target.value })
                  }
                />
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    onClick={() => handleKYCAction(kyc.id, "approved")}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleKYCAction(kyc.id, "rejected")}
                    className="flex-1"
                    disabled={!rejectionReasons[kyc.id]}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {kycRequests.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No pending KYC verifications
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="properties" className="space-y-4">
          {properties.map((property) => (
            <Card key={property.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{property.title}</CardTitle>
                    <CardDescription>
                      {property.address} - Submitted by {property.profiles.email}
                    </CardDescription>
                  </div>
                  <Badge className="capitalize">{property.property_type}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Valuation:</span>
                    <p className="font-semibold">${Number(property.valuation).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <p className="font-semibold capitalize">{property.property_type}</p>
                  </div>
                </div>
                <Textarea
                  placeholder="Rejection reason (if rejecting)..."
                  value={rejectionReasons[property.id] || ""}
                  onChange={(e) =>
                    setRejectionReasons({ ...rejectionReasons, [property.id]: e.target.value })
                  }
                />
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    onClick={() => handlePropertyAction(property.id, "approved")}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handlePropertyAction(property.id, "rejected")}
                    className="flex-1"
                    disabled={!rejectionReasons[property.id]}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {properties.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No pending property reviews
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;