import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

interface DashboardHeaderProps {
  userMode: "buyer" | "seller";
  isAdmin: boolean;
  onModeSwitch: (mode: "buyer" | "seller") => void;
}

const DashboardHeader = ({ userMode, isAdmin, onModeSwitch }: DashboardHeaderProps) => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          {isAdmin && (
            <div className="flex items-center gap-2 mt-2">
              <Shield className="h-5 w-5 text-primary" />
              <Badge variant="default">Admin Access</Badge>
            </div>
          )}
        </div>
        {!isAdmin && (
          <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
            <Button
              variant={userMode === "buyer" ? "default" : "ghost"}
              size="sm"
              onClick={() => onModeSwitch("buyer")}
              className="transition-all"
            >
              Buyer Mode
            </Button>
            <Button
              variant={userMode === "seller" ? "default" : "ghost"}
              size="sm"
              onClick={() => onModeSwitch("seller")}
              className="transition-all"
            >
              Seller Mode
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;