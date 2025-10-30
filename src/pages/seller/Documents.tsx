import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Image, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import KYCVerification from "@/components/dashboard/KYCVerification";

interface KYCData {
  id: string;
  status: string;
  verification_type: string;
  created_at: string;
  verified_at: string | null;
}

interface PropertyDoc {
  id: string;
  title: string;
  ownership_documents: any[];
  property_images: any[];
  status: string;
}

const Documents = () => {
  const [kycData, setKycData] = useState<KYCData | null>(null);
  const [properties, setProperties] = useState<PropertyDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch KYC verification data
      const { data: kycInfo, error: kycError } = await supabase
        .from("kyc_verifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!kycError && kycInfo) {
        setKycData(kycInfo);
      }

      // Fetch properties with documents
      const { data: propertiesData, error: propsError } = await supabase
        .from("properties")
        .select("id, title, ownership_documents, property_images, status")
        .eq("owner_id", user.id);

      if (!propsError && propertiesData) {
        setProperties(propertiesData as PropertyDoc[]);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to load documents");
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      approved: "default",
      pending: "secondary",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
        <p className="text-muted-foreground">Manage your verification and property documents</p>
      </div>

      {/* KYC Verification Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            KYC/KYB Verification
          </CardTitle>
          <CardDescription>Your identity verification status and documents</CardDescription>
        </CardHeader>
        <CardContent>
          {kycData ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(kycData.status)}
                  <span className="font-medium">Verification Status:</span>
                  {getStatusBadge(kycData.status)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Type: {kycData.verification_type.toUpperCase()}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Submitted: {new Date(kycData.created_at).toLocaleDateString()}
                {kycData.verified_at && (
                  <> • Verified: {new Date(kycData.verified_at).toLocaleDateString()}</>
                )}
              </div>
            </div>
          ) : (
            <KYCVerification 
              currentStatus="not_started" 
              onStatusChange={fetchDocuments}
            />
          )}
        </CardContent>
      </Card>

      {/* Property Documents Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Property Documents
          </CardTitle>
          <CardDescription>Documents and images for your listed properties</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground">Loading documents...</p>
          ) : properties.length === 0 ? (
            <p className="text-center text-muted-foreground">No properties found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Ownership Docs</TableHead>
                  <TableHead className="text-center">Images</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium">{property.title}</TableCell>
                    <TableCell>{getStatusBadge(property.status)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">
                        {Array.isArray(property.ownership_documents) 
                          ? property.ownership_documents.length 
                          : 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">
                        {Array.isArray(property.property_images) 
                          ? property.property_images.length 
                          : 0}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Documents;
