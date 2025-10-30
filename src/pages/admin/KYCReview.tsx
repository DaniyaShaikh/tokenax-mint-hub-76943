import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  XCircle, 
  Building, 
  User, 
  FileText, 
  Calendar,
  AlertCircle,
  RefreshCw,
  Eye,
  MapPin,
  Shield,
  Clock,
  Edit,
  Upload
} from "lucide-react";
import { toast } from "sonner";

interface KYCVerification {
  id: string;
  user_id: string;
  verification_type: string;
  status: string;
  company_name?: string;
  created_at: string;
  verified_at?: string;
  rejection_reason?: string;
  admin_notes?: string;
  verification_data?: {
    personalInfo?: {
      firstName?: string;
      lastName?: string;
      dateOfBirth?: string;
      nationality?: string;
      phoneNumber?: string;
    };
    address?: {
      street?: string;
      city?: string;
      postalCode?: string;
      country?: string;
    };
    documents?: {
      idDocument?: string;
      proofOfAddress?: string;
      selfie?: string;
    };
    companyInfo?: {
      name?: string;
      registrationNumber?: string;
      taxId?: string;
    };
    submittedAt?: string;
  };
  profiles: {
    email: string;
    full_name?: string;
  };
}

const KYCReview = () => {
  const [verifications, setVerifications] = useState<KYCVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedKYC, setSelectedKYC] = useState<KYCVerification | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState<any>(null);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [docFiles, setDocFiles] = useState<{
    idDocument?: File;
    proofOfAddress?: File;
    selfie?: File;
    companyDocuments?: File;
  }>({});

  useEffect(() => {
    loadVerifications();
  }, [activeTab]);

  const loadVerifications = async () => {
    try {
      const { data } = await supabase
        .from("kyc_verifications")
        .select(`
          *,
          profiles (email, full_name)
        `)
        .eq("review_status", activeTab)
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

  const handleAction = async (action: "approved" | "rejected" | "needs_revision") => {
    if (!selectedKYC) return;

    if (action === "rejected" && !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      const { error } = await supabase
        .from("kyc_verifications")
        .update({
          status: action,
          review_status: action,
          verified_at: action === "approved" ? new Date().toISOString() : null,
          rejection_reason: action === "rejected" ? rejectionReason : null,
          admin_notes: adminNotes || null,
        })
        .eq("id", selectedKYC.id);

      if (error) throw error;

      toast.success(`Verification ${action.replace("_", " ")}`);
      setSelectedKYC(null);
      setAdminNotes("");
      setRejectionReason("");
      setEditMode(false);
      setEditedData(null);
      loadVerifications();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleFileUpload = async (fileType: string, file: File) => {
    if (!selectedKYC) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedKYC.user_id}/${fileType}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      return data.path;
    } catch (error: any) {
      toast.error(`Failed to upload ${fileType}: ${error.message}`);
      return null;
    }
  };

  const handleUploadAndApprove = async () => {
    if (!selectedKYC || !editedData) return;

    setUploadingDocs(true);
    try {
      // Upload any new documents
      const uploadedPaths: any = {};
      
      if (docFiles.idDocument) {
        uploadedPaths.idDocument = await handleFileUpload('id_document', docFiles.idDocument);
      }
      if (docFiles.proofOfAddress) {
        uploadedPaths.proofOfAddress = await handleFileUpload('proof_of_address', docFiles.proofOfAddress);
      }
      if (docFiles.selfie) {
        uploadedPaths.selfie = await handleFileUpload('selfie', docFiles.selfie);
      }
      if (docFiles.companyDocuments && selectedKYC.verification_type === 'kyb') {
        uploadedPaths.companyDocuments = await handleFileUpload('company_documents', docFiles.companyDocuments);
      }

      // Update verification data with new document paths
      const updatedData = {
        ...editedData,
        documents: {
          ...editedData.documents,
          ...uploadedPaths
        }
      };

      const { error } = await supabase
        .from("kyc_verifications")
        .update({
          status: "approved",
          review_status: "approved",
          verification_data: updatedData,
          admin_notes: adminNotes || null,
          rejection_reason: null,
          verified_at: new Date().toISOString(),
        })
        .eq("id", selectedKYC.id);

      if (error) throw error;

      toast.success("Documents uploaded and verification approved!");
      setSelectedKYC(null);
      setAdminNotes("");
      setEditMode(false);
      setEditedData(null);
      setDocFiles({});
      loadVerifications();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploadingDocs(false);
    }
  };

  const handleResubmit = async () => {
    if (!selectedKYC || !editedData) return;

    try {
      const { error } = await supabase
        .from("kyc_verifications")
        .update({
          status: "pending",
          review_status: "pending",
          verification_data: editedData,
          admin_notes: adminNotes || null,
          rejection_reason: null,
        })
        .eq("id", selectedKYC.id);

      if (error) throw error;

      toast.success("Verification resubmitted for review");
      setSelectedKYC(null);
      setAdminNotes("");
      setEditMode(false);
      setEditedData(null);
      loadVerifications();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const enableEditMode = () => {
    if (selectedKYC?.verification_data) {
      setEditedData(JSON.parse(JSON.stringify(selectedKYC.verification_data)));
      setEditMode(true);
    }
  };

  const getStepStatus = (data: any, step: string): "complete" | "incomplete" | "missing" => {
    switch (step) {
      case "personal":
        return data?.personalInfo?.firstName && data?.personalInfo?.lastName 
          ? "complete" : "incomplete";
      case "address":
        return data?.address?.street && data?.address?.city 
          ? "complete" : "incomplete";
      case "documents":
        return data?.documents?.idDocument && data?.documents?.proofOfAddress 
          ? "complete" : "incomplete";
      case "company":
        return data?.companyInfo?.name && data?.companyInfo?.registrationNumber 
          ? "complete" : "incomplete";
      default:
        return "missing";
    }
  };

  const renderVerificationDetails = (kyc: KYCVerification) => {
    const isKYB = kyc.verification_type === "kyb";
    const data = editMode ? editedData : kyc.verification_data;
    const canEdit = kyc.status === "needs_revision";

    return (
      <div className="space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Personal Info</p>
              </div>
              <Badge variant={getStepStatus(data, "personal") === "complete" ? "default" : "secondary"}>
                {getStepStatus(data, "personal")}
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-accent" />
                <p className="text-sm font-medium">Address</p>
              </div>
              <Badge variant={getStepStatus(data, "address") === "complete" ? "default" : "secondary"}>
                {getStepStatus(data, "address")}
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-success">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-success" />
                <p className="text-sm font-medium">Documents</p>
              </div>
              <Badge variant={getStepStatus(data, "documents") === "complete" ? "default" : "secondary"}>
                {getStepStatus(data, "documents")}
              </Badge>
            </CardContent>
          </Card>

          {isKYB && (
            <Card className="border-l-4 border-l-secondary">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="h-4 w-4 text-secondary" />
                  <p className="text-sm font-medium">Company</p>
                </div>
                <Badge variant={getStepStatus(data, "company") === "complete" ? "default" : "secondary"}>
                  {getStepStatus(data, "company")}
                </Badge>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Personal Information */}
        {data?.personalInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription>Basic identity details</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">First Name</Label>
                {editMode ? (
                  <Input
                    value={editedData.personalInfo?.firstName || ""}
                    onChange={(e) => setEditedData({
                      ...editedData,
                      personalInfo: { ...editedData.personalInfo, firstName: e.target.value }
                    })}
                  />
                ) : (
                  <p className="font-medium">{data.personalInfo.firstName || "N/A"}</p>
                )}
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Last Name</Label>
                {editMode ? (
                  <Input
                    value={editedData.personalInfo?.lastName || ""}
                    onChange={(e) => setEditedData({
                      ...editedData,
                      personalInfo: { ...editedData.personalInfo, lastName: e.target.value }
                    })}
                  />
                ) : (
                  <p className="font-medium">{data.personalInfo.lastName || "N/A"}</p>
                )}
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Date of Birth</Label>
                {editMode ? (
                  <Input
                    type="date"
                    value={editedData.personalInfo?.dateOfBirth || ""}
                    onChange={(e) => setEditedData({
                      ...editedData,
                      personalInfo: { ...editedData.personalInfo, dateOfBirth: e.target.value }
                    })}
                  />
                ) : (
                  <p className="font-medium">{data.personalInfo.dateOfBirth || "N/A"}</p>
                )}
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Nationality</Label>
                {editMode ? (
                  <Input
                    value={editedData.personalInfo?.nationality || ""}
                    onChange={(e) => setEditedData({
                      ...editedData,
                      personalInfo: { ...editedData.personalInfo, nationality: e.target.value }
                    })}
                  />
                ) : (
                  <p className="font-medium">{data.personalInfo.nationality || "N/A"}</p>
                )}
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Phone Number</Label>
                {editMode ? (
                  <Input
                    value={editedData.personalInfo?.phoneNumber || ""}
                    onChange={(e) => setEditedData({
                      ...editedData,
                      personalInfo: { ...editedData.personalInfo, phoneNumber: e.target.value }
                    })}
                  />
                ) : (
                  <p className="font-medium">{data.personalInfo.phoneNumber || "N/A"}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Company Information (KYB only) */}
        {isKYB && data?.companyInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5 text-secondary" />
                Company Information
              </CardTitle>
              <CardDescription>Tell us about your business</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Company Name</Label>
                {editMode ? (
                  <Input
                    value={editedData.companyInfo?.name || ""}
                    onChange={(e) => setEditedData({
                      ...editedData,
                      companyInfo: { ...editedData.companyInfo, name: e.target.value }
                    })}
                  />
                ) : (
                  <p className="font-medium">{data.companyInfo.name || "N/A"}</p>
                )}
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Registration Number</Label>
                {editMode ? (
                  <Input
                    value={editedData.companyInfo?.registrationNumber || ""}
                    onChange={(e) => setEditedData({
                      ...editedData,
                      companyInfo: { ...editedData.companyInfo, registrationNumber: e.target.value }
                    })}
                  />
                ) : (
                  <p className="font-medium">{data.companyInfo.registrationNumber || "N/A"}</p>
                )}
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Tax ID</Label>
                {editMode ? (
                  <Input
                    value={editedData.companyInfo?.taxId || ""}
                    onChange={(e) => setEditedData({
                      ...editedData,
                      companyInfo: { ...editedData.companyInfo, taxId: e.target.value }
                    })}
                  />
                ) : (
                  <p className="font-medium">{data.companyInfo.taxId || "N/A"}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Address Information */}
        {data?.address && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-accent" />
                {isKYB ? "Business Address" : "Residential Address"}
              </CardTitle>
              <CardDescription>
                {isKYB ? "Where is your business located?" : "Where do you currently reside?"}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-sm text-muted-foreground">Street Address</Label>
                {editMode ? (
                  <Input
                    value={editedData.address?.street || ""}
                    onChange={(e) => setEditedData({
                      ...editedData,
                      address: { ...editedData.address, street: e.target.value }
                    })}
                  />
                ) : (
                  <p className="font-medium">{data.address.street || "N/A"}</p>
                )}
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">City</Label>
                {editMode ? (
                  <Input
                    value={editedData.address?.city || ""}
                    onChange={(e) => setEditedData({
                      ...editedData,
                      address: { ...editedData.address, city: e.target.value }
                    })}
                  />
                ) : (
                  <p className="font-medium">{data.address.city || "N/A"}</p>
                )}
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Postal Code</Label>
                {editMode ? (
                  <Input
                    value={editedData.address?.postalCode || ""}
                    onChange={(e) => setEditedData({
                      ...editedData,
                      address: { ...editedData.address, postalCode: e.target.value }
                    })}
                  />
                ) : (
                  <p className="font-medium">{data.address.postalCode || "N/A"}</p>
                )}
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Country</Label>
                {editMode ? (
                  <Input
                    value={editedData.address?.country || ""}
                    onChange={(e) => setEditedData({
                      ...editedData,
                      address: { ...editedData.address, country: e.target.value }
                    })}
                  />
                ) : (
                  <p className="font-medium">{data.address.country || "N/A"}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents */}
        {data?.documents && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-success" />
                {isKYB ? "Business Documents" : "Identification Documents"}
              </CardTitle>
              <CardDescription>
                {editMode 
                  ? "Upload any missing documents below" 
                  : isKYB 
                    ? "Business verification documents" 
                    : "Identity verification documents"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {isKYB ? "Certificate of Incorporation" : "ID Document"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {isKYB ? "Official registration document" : "Passport/Driver's License"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {data.documents.idDocument ? (
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Uploaded
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="h-3 w-3 mr-1" />
                      Missing
                    </Badge>
                  )}
                  {editMode && !data.documents.idDocument && (
                    <Input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setDocFiles({ ...docFiles, idDocument: file });
                      }}
                      className="w-48 text-xs"
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {isKYB ? "Proof of Business Address" : "Proof of Address"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {isKYB ? "Utility bill or lease agreement" : "Utility Bill/Bank Statement (less than 3 months)"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {data.documents.proofOfAddress ? (
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Uploaded
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="h-3 w-3 mr-1" />
                      Missing
                    </Badge>
                  )}
                  {editMode && !data.documents.proofOfAddress && (
                    <Input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setDocFiles({ ...docFiles, proofOfAddress: file });
                      }}
                      className="w-48 text-xs"
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Selfie Verification</span>
                    <span className="text-xs text-muted-foreground">
                      Photo holding ID document
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {data.documents.selfie ? (
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Uploaded
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="h-3 w-3 mr-1" />
                      Missing
                    </Badge>
                  )}
                  {editMode && !data.documents.selfie && (
                    <Input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setDocFiles({ ...docFiles, selfie: file });
                      }}
                      className="w-48 text-xs"
                    />
                  )}
                </div>
              </div>
              {isKYB && (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">Company Documents</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {data.documents.companyDocuments ? (
                      <Badge variant="default">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Uploaded
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="h-3 w-3 mr-1" />
                        Missing
                      </Badge>
                    )}
                    {editMode && !data.documents.companyDocuments && (
                      <Input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setDocFiles({ ...docFiles, companyDocuments: file });
                        }}
                        className="w-48 text-xs"
                      />
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Admin Actions */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Admin Intervention
              </CardTitle>
              {canEdit && !editMode && (
                <Button
                  onClick={enableEditMode}
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit & Resubmit
                </Button>
              )}
              {editMode && (
                <Button
                  onClick={() => {
                    setEditMode(false);
                    setEditedData(null);
                  }}
                  variant="ghost"
                  size="sm"
                >
                  Cancel Edit
                </Button>
              )}
            </div>
            {editMode && (
              <CardDescription className="text-amber-600 dark:text-amber-400">
                ✏️ Edit mode active - Update user details and resubmit for verification
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Notes (Internal)</label>
              <Textarea
                placeholder="Add internal notes about this verification..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            {!editMode && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Rejection Reason (Visible to User)</label>
                <Textarea
                  placeholder="Explain why this verification is being rejected or needs revision..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            )}

            {editMode ? (
              <div className="space-y-3">
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-900 dark:text-amber-100 mb-2">
                    <strong>Admin Intervention for "Needs Revision":</strong> Upload missing documents or fix user data, then choose an action below.
                  </p>
                  <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-1 ml-4 list-disc">
                    <li><strong>Upload & Approve:</strong> Fix issues yourself and approve immediately</li>
                    <li><strong>Request Revision:</strong> Send back to user with notes on what to fix</li>
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleUploadAndApprove}
                    disabled={uploadingDocs}
                    className="bg-gradient-to-r from-success to-success/80 text-white hover:shadow-lg rounded-full"
                  >
                    {uploadingDocs ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Upload & Approve
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleResubmit}
                    variant="outline"
                    className="rounded-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Request Revision
                  </Button>
                </div>
              </div>
            ) : kyc.status === "rejected" ? (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-900 dark:text-red-100">
                  <strong>Rejected - Final Decision:</strong> This application has been permanently rejected. No further actions can be taken. User must start a new application if needed.
                </p>
                {kyc.rejection_reason && (
                  <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-800">
                    <p className="text-xs font-medium text-red-800 dark:text-red-200 mb-1">Rejection Reason:</p>
                    <p className="text-sm text-red-700 dark:text-red-300">{kyc.rejection_reason}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <Button
                  onClick={() => handleAction("approved")}
                  className="bg-gradient-to-r from-success to-success/80 text-white hover:shadow-lg hover:shadow-success/25 rounded-full"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleAction("needs_revision")}
                  variant="outline"
                  className="rounded-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Request Revision
                </Button>
                <Button
                  onClick={() => handleAction("rejected")}
                  variant="destructive"
                  className="rounded-full"
                  disabled={!rejectionReason.trim()}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
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
        <div className="relative">
          <h1 className="text-4xl font-bold text-white mb-2">KYC / KYB Review</h1>
          <p className="text-white/90 text-lg">
            Review and verify user identity documents with detailed step tracking
          </p>
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approved
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Rejected
          </TabsTrigger>
          <TabsTrigger value="needs_revision" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Needs Revision
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Applicant</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Submitted</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {verifications.map((kyc) => {
                    const isKYB = kyc.verification_type === "kyb";
                    const displayName = isKYB 
                      ? kyc.company_name 
                      : `${kyc.verification_data?.personalInfo?.firstName || ''} ${kyc.verification_data?.personalInfo?.lastName || ''}`.trim() || kyc.profiles.full_name;

                    return (
                      <tr 
                        key={kyc.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                              {isKYB ? (
                                <Building className="h-5 w-5" />
                              ) : (
                                <User className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{displayName || "N/A"}</p>
                              <p className="text-sm text-muted-foreground">{kyc.profiles.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className="bg-gradient-to-r from-primary to-secondary text-white border-0">
                            {kyc.verification_type.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {new Date(kyc.created_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {activeTab === 'pending' && (
                            <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending Review
                            </Badge>
                          )}
                          {activeTab === 'approved' && (
                            <Badge variant="outline" className="border-success text-success">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approved
                            </Badge>
                          )}
                          {activeTab === 'rejected' && (
                            <Badge variant="outline" className="border-destructive text-destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Rejected
                            </Badge>
                          )}
                          {activeTab === 'needs_revision' && (
                            <Badge variant="outline" className="border-orange-500 text-orange-600 dark:text-orange-400">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Needs Revision
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm"
                                className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/25 rounded-full"
                                onClick={() => {
                                  setSelectedKYC(kyc);
                                  setAdminNotes(kyc.admin_notes || "");
                                  setRejectionReason(kyc.rejection_reason || "");
                                  setEditMode(false);
                                  setEditedData(null);
                                  setDocFiles({});
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="text-2xl flex items-center gap-2">
                                  <Shield className="h-6 w-6 text-primary" />
                                  {isKYB ? "KYB" : "KYC"} Verification Review
                                </DialogTitle>
                                <p className="text-muted-foreground">{displayName} • {kyc.profiles.email}</p>
                              </DialogHeader>
                              {selectedKYC && renderVerificationDetails(selectedKYC)}
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {verifications.length === 0 && (
            <div className="rounded-lg border border-border bg-card p-16 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">All Clear!</h3>
                  <p className="text-muted-foreground">
                    No {activeTab} verifications at the moment.
                  </p>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KYCReview;