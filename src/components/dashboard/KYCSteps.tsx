import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Camera, Upload, CheckCircle2, User, Building2, FileText, Shield } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface KYCStepsProps {
  verificationType: "kyc" | "kyb";
  onComplete: () => void;
}

const KYCSteps = ({ verificationType, onComplete }: KYCStepsProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    nationality: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    companyName: "",
    registrationNumber: "",
    taxId: "",
    idDocument: null as File | null,
    proofOfAddress: null as File | null,
    selfie: null as File | null,
  });

  const totalSteps = verificationType === "kyc" ? 4 : 5;
  const progress = (currentStep / totalSteps) * 100;

  const handleFileChange = (field: string, file: File | null) => {
    setFormData({ ...formData, [field]: file });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("Not authenticated");

      // Prepare verification data with all collected information
      const verificationData = {
        personalInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          nationality: formData.nationality,
        },
        address: {
          street: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        documents: {
          idDocument: formData.idDocument?.name || null,
          proofOfAddress: formData.proofOfAddress?.name || null,
          selfie: formData.selfie?.name || null,
        },
        ...(verificationType === "kyb" && {
          companyInfo: {
            name: formData.companyName,
            registrationNumber: formData.registrationNumber,
            taxId: formData.taxId,
          },
        }),
        submittedAt: new Date().toISOString(),
      };

      const { data: newRecord, error } = await supabase
        .from("kyc_verifications")
        .insert({
          user_id: user.data.user.id,
          verification_type: verificationType,
          company_name: verificationType === "kyb" ? formData.companyName : null,
          status: "pending",
          verification_data: verificationData,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Verification submitted! Processing...");
      
      // Simulate approval process (2 seconds)
      setTimeout(async () => {
        const { error: updateError } = await supabase
          .from("kyc_verifications")
          .update({ 
            status: "approved",
            verified_at: new Date().toISOString()
          })
          .eq("id", newRecord.id);

        if (!updateError) {
          toast.success("KYC Approved! Welcome aboard!");
          setTimeout(() => {
            onComplete();
          }, 500);
        } else {
          console.error("Failed to approve KYC:", updateError);
        }
      }, 2000);
      
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <User className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Personal Information</h3>
                <p className="text-sm text-muted-foreground">Let's start with your basic details</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  placeholder="United States"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        if (verificationType === "kyb") {
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Company Information</h3>
                  <p className="text-sm text-muted-foreground">Tell us about your business</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Acme Corporation"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    placeholder="12345678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    placeholder="XX-XXXXXXX"
                  />
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Address Verification</h3>
                <p className="text-sm text-muted-foreground">Where do you currently reside?</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main Street"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="New York"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder="10001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="United States"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        const isAddressStep = verificationType === "kyb";
        if (isAddressStep) {
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Business Address</h3>
                  <p className="text-sm text-muted-foreground">Where is your business located?</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Business Blvd"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="New York"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="10001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="United States"
                  />
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Document Upload</h3>
                <p className="text-sm text-muted-foreground">Upload your identification documents</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-accent transition-colors">
                <Label htmlFor="idDocument" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="font-medium">ID Document (Passport/Driver's License)</span>
                    <span className="text-sm text-muted-foreground">Click to upload or drag and drop</span>
                    {formData.idDocument && (
                      <span className="text-sm text-accent flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> {formData.idDocument.name}
                      </span>
                    )}
                  </div>
                </Label>
                <Input
                  id="idDocument"
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileChange("idDocument", e.target.files?.[0] || null)}
                  accept="image/*,.pdf"
                />
              </div>
              <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-accent transition-colors">
                <Label htmlFor="proofOfAddress" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="font-medium">Proof of Address (Utility Bill/Bank Statement)</span>
                    <span className="text-sm text-muted-foreground">Document must be less than 3 months old</span>
                    {formData.proofOfAddress && (
                      <span className="text-sm text-accent flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> {formData.proofOfAddress.name}
                      </span>
                    )}
                  </div>
                </Label>
                <Input
                  id="proofOfAddress"
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileChange("proofOfAddress", e.target.files?.[0] || null)}
                  accept="image/*,.pdf"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        if (verificationType === "kyb") {
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Business Documents</h3>
                  <p className="text-sm text-muted-foreground">Upload your business verification documents</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-accent transition-colors">
                  <Label htmlFor="idDocument" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="font-medium">Certificate of Incorporation</span>
                      <span className="text-sm text-muted-foreground">Official registration document</span>
                      {formData.idDocument && (
                        <span className="text-sm text-accent flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" /> {formData.idDocument.name}
                        </span>
                      )}
                    </div>
                  </Label>
                  <Input
                    id="idDocument"
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileChange("idDocument", e.target.files?.[0] || null)}
                    accept="image/*,.pdf"
                  />
                </div>
                <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-accent transition-colors">
                  <Label htmlFor="proofOfAddress" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="font-medium">Proof of Business Address</span>
                      <span className="text-sm text-muted-foreground">Utility bill or lease agreement</span>
                      {formData.proofOfAddress && (
                        <span className="text-sm text-accent flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" /> {formData.proofOfAddress.name}
                        </span>
                      )}
                    </div>
                  </Label>
                  <Input
                    id="proofOfAddress"
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileChange("proofOfAddress", e.target.files?.[0] || null)}
                    accept="image/*,.pdf"
                  />
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Camera className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Selfie Verification</h3>
                <p className="text-sm text-muted-foreground">Take a selfie for identity verification</p>
              </div>
            </div>
            <div className="border-2 border-dashed border-border rounded-lg p-8 hover:border-accent transition-colors">
              <Label htmlFor="selfie" className="cursor-pointer">
                <div className="flex flex-col items-center gap-3">
                  <Camera className="h-12 w-12 text-muted-foreground" />
                  <span className="font-medium">Take or Upload Selfie</span>
                  <span className="text-sm text-muted-foreground text-center">
                    Make sure your face is clearly visible and well-lit
                  </span>
                  {formData.selfie && (
                    <span className="text-sm text-accent flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" /> {formData.selfie.name}
                    </span>
                  )}
                </div>
              </Label>
              <Input
                id="selfie"
                type="file"
                className="hidden"
                onChange={(e) => handleFileChange("selfie", e.target.files?.[0] || null)}
                accept="image/*"
                capture="user"
              />
            </div>
            <div className="bg-accent-light p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-1">Tips for a great selfie:</p>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Remove glasses and face coverings</li>
                    <li>• Ensure good lighting on your face</li>
                    <li>• Look directly at the camera</li>
                    <li>• Use a neutral expression</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Camera className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Director Verification</h3>
                <p className="text-sm text-muted-foreground">Selfie of authorized company representative</p>
              </div>
            </div>
            <div className="border-2 border-dashed border-border rounded-lg p-8 hover:border-accent transition-colors">
              <Label htmlFor="selfie" className="cursor-pointer">
                <div className="flex flex-col items-center gap-3">
                  <Camera className="h-12 w-12 text-muted-foreground" />
                  <span className="font-medium">Take or Upload Photo</span>
                  <span className="text-sm text-muted-foreground text-center">
                    Photo of company director or authorized representative
                  </span>
                  {formData.selfie && (
                    <span className="text-sm text-accent flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" /> {formData.selfie.name}
                    </span>
                  )}
                </div>
              </Label>
              <Input
                id="selfie"
                type="file"
                className="hidden"
                onChange={(e) => handleFileChange("selfie", e.target.files?.[0] || null)}
                accept="image/*"
                capture="user"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Identity Verification - Step {currentStep} of {totalSteps}</CardTitle>
        <CardDescription>
          {verificationType === "kyc" ? "Individual (KYC)" : "Business (KYB)"} Verification Process
        </CardDescription>
        <Progress value={progress} className="mt-4" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {renderStep()}
          <div className="flex justify-between pt-6">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            {currentStep < totalSteps ? (
              <Button onClick={handleNext} className="ml-auto">
                Next Step
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="ml-auto">
                Submit Verification
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KYCSteps;
