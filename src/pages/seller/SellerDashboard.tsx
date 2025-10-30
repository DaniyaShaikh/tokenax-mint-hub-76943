import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, DollarSign, TrendingUp, Clock } from "lucide-react";

const SellerDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Seller Dashboard</h2>
        <p className="text-muted-foreground">Manage your properties and track earnings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-normal text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Total Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">Listed properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-normal text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-normal text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$0</div>
            <p className="text-xs text-muted-foreground mt-1">From token sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-normal text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Active Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">Properties selling</p>
          </CardContent>
        </Card>
      </div>

      {/* Welcome Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold mb-2">Welcome to the Seller Portal</h3>
          <p className="text-muted-foreground">
            List your properties, manage tokenization, and track your earnings all in one place.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerDashboard;
