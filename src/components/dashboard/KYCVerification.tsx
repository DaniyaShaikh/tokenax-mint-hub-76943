import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, Shield, AlertCircle } from "lucide-react";
import KYCSteps from "./KYCSteps";

interface KYCVerificationProps {
  currentStatus: string | null;
  onStatusChange: () => void;
}

const KYCVerification = ({ currentStatus, onStatusChange }: KYCVerificationProps) => {
  const [verificationType, setVerificationType] = useState<"kyc" | "kyb">("kyc");
  const [showSteps, setShowSteps] = useState(false);

  const getStatusIcon = () => {
    switch (currentStatus) {
      case "approved":
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case "rejected":
        return <XCircle className="h-8 w-8 text-destructive" />;
      case "needs_revision":
        return <AlertCircle className="h-8 w-8 text-warning" />;
      case "pending":
        return <Clock className="h-8 w-8 text-yellow-500" />;
      default:
        return <Shield className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "default",
      approved: "default",
      rejected: "destructive",
      needs_revision: "secondary",
    };
    return currentStatus ? (
      <Badge variant={variants[currentStatus] || "secondary"}>{currentStatus.replace("_", " ")}</Badge>
    ) : null;
  };

  if (showSteps) {
    return (
      <div className="py-8">
        <KYCSteps 
          verificationType={verificationType} 
          onComplete={() => {
            setShowSteps(false);
            onStatusChange();
          }} 
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card className="border-2">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">{getStatusIcon()}</div>
          <CardTitle className="text-2xl">Identity Verification</CardTitle>
          <CardDescription>
            {currentStatus === "approved"
              ? "Your identity has been verified"
              : currentStatus === "pending"
              ? "Your verification is under review"
              : currentStatus === "rejected"
              ? "Your verification was rejected"
              : currentStatus === "needs_revision"
              ? "Your verification needs revision - please resubmit"
              : "Complete KYC/KYB to start listing properties"}
          </CardDescription>
          {getStatusBadge()}
        </CardHeader>
        <CardContent>
          {!currentStatus || currentStatus === "rejected" || currentStatus === "needs_revision" ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Choose your verification type to get started
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={verificationType === "kyc" ? "default" : "outline"}
                    className="h-auto py-6 flex flex-col gap-2"
                    onClick={() => setVerificationType("kyc")}
                  >
                    <Shield className="h-8 w-8" />
                    <span className="font-semibold">Individual</span>
                    <span className="text-xs opacity-80">KYC Verification</span>
                  </Button>
                  <Button
                    variant={verificationType === "kyb" ? "default" : "outline"}
                    className="h-auto py-6 flex flex-col gap-2"
                    onClick={() => setVerificationType("kyb")}
                  >
                    <Shield className="h-8 w-8" />
                    <span className="font-semibold">Business</span>
                    <span className="text-xs opacity-80">KYB Verification</span>
                  </Button>
                </div>

                <div className="bg-accent-light p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium">Verification Process:</p>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Personal/Business Information</li>
                    <li>Address Verification</li>
                    <li>Document Upload</li>
                    <li>Identity Confirmation</li>
                  </ol>
                  <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                    ⏱ Estimated time: 5-10 minutes | 🔒 Your data is encrypted and secure
                  </p>
                </div>
              </div>

              <Button onClick={() => setShowSteps(true)} className="w-full" size="lg">
                Start {verificationType === "kyc" ? "KYC" : "KYB"} Verification
              </Button>
            </div>
          ) : currentStatus === "pending" ? (
            <div className="text-center py-8 space-y-4">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-warning/10">
                <Clock className="h-8 w-8 text-warning" />
              </div>
              <div>
                <p className="font-medium text-foreground">Verification Under Review</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Your verification is being reviewed by our team.
                </p>
                <p className="text-sm text-muted-foreground">This usually takes 24-48 hours.</p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default KYCVerification;