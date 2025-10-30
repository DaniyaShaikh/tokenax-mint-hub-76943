import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { 
  MapPin, 
  Building, 
  DollarSign, 
  Coins, 
  TrendingUp, 
  Calendar,
  PieChart,
  BarChart3
} from "lucide-react";

interface Investment {
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyType: string;
  propertyValuation: number;
  propertyImages: any;
  totalTokens: number;
  availableTokens: number;
  pricePerToken: number;
  userTokens: number;
  totalInvested: number;
  firstPurchaseDate: string;
  purchases: Array<{
    date: string;
    tokens: number;
    amount: number;
  }>;
}

interface InvestmentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investment: Investment | null;
}

const InvestmentDetailsDialog = ({ open, onOpenChange, investment }: InvestmentDetailsDialogProps) => {
  if (!investment) return null;

  const images = Array.isArray(investment.propertyImages) ? investment.propertyImages : [];
  const userOwnershipPercentage = (investment.userTokens / investment.totalTokens) * 100;
  const soldTokens = investment.totalTokens - investment.availableTokens;
  const fundingProgress = (soldTokens / investment.totalTokens) * 100;
  const userShareValue = (investment.propertyValuation * investment.userTokens) / investment.totalTokens;
  const profitLoss = userShareValue - investment.totalInvested;
  const roi = (profitLoss / investment.totalInvested) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Investment Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Images */}
          {images.length > 0 && (
            <Carousel className="w-full">
              <CarouselContent>
                {images.map((img: any, idx: number) => (
                  <CarouselItem key={idx}>
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <img
                        src={img.url || img}
                        alt={`${investment.propertyTitle} - ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {images.length > 1 && (
                <>
                  <CarouselPrevious />
                  <CarouselNext />
                </>
              )}
            </Carousel>
          )}

          {/* Property Header */}
          <div>
            <h2 className="text-3xl font-bold mb-2">{investment.propertyTitle}</h2>
            <p className="text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {investment.propertyAddress}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="secondary" className="gap-1">
                <Building className="h-3 w-3" />
                {investment.propertyType}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <DollarSign className="h-3 w-3" />
                {investment.propertyValuation.toLocaleString("en-US", { 
                  style: "currency", 
                  currency: "USD",
                  maximumFractionDigits: 0
                })}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Your Investment Summary */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Your Investment Summary
            </h3>
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground font-normal">Tokens Owned</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{investment.userTokens.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {userOwnershipPercentage.toFixed(2)}% ownership
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground font-normal">Total Invested</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {investment.totalInvested.toLocaleString("en-US", { 
                      style: "currency", 
                      currency: "USD",
                      maximumFractionDigits: 0
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Avg: {investment.pricePerToken.toLocaleString("en-US", { style: "currency", currency: "USD" })}/token
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground font-normal">Current Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userShareValue.toLocaleString("en-US", { 
                      style: "currency", 
                      currency: "USD",
                      maximumFractionDigits: 0
                    })}
                  </div>
                  <p className={`text-xs mt-1 flex items-center gap-1 ${profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {profitLoss >= 0 ? "+" : ""}
                    {profitLoss.toLocaleString("en-US", { 
                      style: "currency", 
                      currency: "USD",
                      maximumFractionDigits: 0
                    })}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground font-normal">ROI</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${roi >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {roi >= 0 ? "+" : ""}{roi.toFixed(2)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Since {new Date(investment.firstPurchaseDate).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Token Analysis */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Token Analysis
            </h3>
            
            <div className="space-y-4">
              {/* Overall Funding Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Property Funding Progress</span>
                  <span className="text-muted-foreground">{fundingProgress.toFixed(1)}%</span>
                </div>
                <Progress value={fundingProgress} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{soldTokens.toLocaleString()} tokens sold</span>
                  <span>{investment.availableTokens.toLocaleString()} available</span>
                </div>
              </div>

              {/* Your Ownership Share */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Your Ownership Share</span>
                  <span className="text-lg font-bold">{userOwnershipPercentage.toFixed(2)}%</span>
                </div>
                <Progress value={userOwnershipPercentage} className="h-2" />
              </div>

              {/* Token Distribution */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Total Tokens</p>
                  <p className="text-lg font-semibold">{investment.totalTokens.toLocaleString()}</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Your Tokens</p>
                  <p className="text-lg font-semibold text-primary">{investment.userTokens.toLocaleString()}</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Token Value</p>
                  <p className="text-lg font-semibold">
                    {investment.pricePerToken.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Purchase History */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Purchase History
            </h3>
            <div className="space-y-3">
              {investment.purchases.map((purchase, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{purchase.tokens.toLocaleString()} Tokens</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(purchase.date).toLocaleDateString("en-US", { 
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {purchase.amount.toLocaleString("en-US", { 
                        style: "currency", 
                        currency: "USD",
                        maximumFractionDigits: 0
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(purchase.amount / purchase.tokens).toLocaleString("en-US", { 
                        style: "currency", 
                        currency: "USD" 
                      })}/token
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Summary */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-3">Investment Performance</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Initial Investment</p>
                  <p className="text-xl font-bold">
                    {investment.totalInvested.toLocaleString("en-US", { 
                      style: "currency", 
                      currency: "USD",
                      maximumFractionDigits: 0
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Value</p>
                  <p className="text-xl font-bold">
                    {userShareValue.toLocaleString("en-US", { 
                      style: "currency", 
                      currency: "USD",
                      maximumFractionDigits: 0
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Profit/Loss</p>
                  <p className={`text-xl font-bold ${profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {profitLoss >= 0 ? "+" : ""}
                    {profitLoss.toLocaleString("en-US", { 
                      style: "currency", 
                      currency: "USD",
                      maximumFractionDigits: 0
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Return on Investment</p>
                  <p className={`text-xl font-bold ${roi >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {roi >= 0 ? "+" : ""}{roi.toFixed(2)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentDetailsDialog;
