import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Search, TrendingUp, TrendingDown, Eye, Building, Wallet } from "lucide-react";
import InvestmentDetailsDialog from "@/components/dashboard/InvestmentDetailsDialog";
import { toast } from "@/hooks/use-toast";

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

const Investments = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    loadInvestments();
  }, []);

  const loadInvestments = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to view your investments",
          variant: "destructive",
        });
        return;
      }

      // Get all token purchases for the user
      const { data: purchases, error: purchasesError } = await supabase
        .from("token_purchases")
        .select("*")
        .eq("buyer_id", user.id)
        .order("purchased_at", { ascending: false });

      if (purchasesError) throw purchasesError;

      if (!purchases || purchases.length === 0) {
        setInvestments([]);
        return;
      }

      // Group purchases by property
      const propertyMap = new Map<string, any[]>();
      purchases.forEach(purchase => {
        const existing = propertyMap.get(purchase.property_id) || [];
        propertyMap.set(purchase.property_id, [...existing, purchase]);
      });

      // Fetch property details for each invested property
      const propertyIds = Array.from(propertyMap.keys());
      const { data: properties, error: propertiesError } = await supabase
        .from("properties")
        .select("*")
        .in("id", propertyIds);

      if (propertiesError) throw propertiesError;

      // Fetch token information
      const { data: tokens, error: tokensError } = await supabase
        .from("property_tokens")
        .select("*")
        .in("property_id", propertyIds);

      if (tokensError) throw tokensError;

      // Combine all data
      const investmentsData: Investment[] = properties?.map(property => {
        const propertyPurchases = propertyMap.get(property.id) || [];
        const tokenInfo = tokens?.find(t => t.property_id === property.id);
        
        const userTokens = propertyPurchases.reduce((sum, p) => sum + p.tokens_purchased, 0);
        const totalInvested = propertyPurchases.reduce((sum, p) => sum + p.total_amount, 0);
        const firstPurchase = propertyPurchases[propertyPurchases.length - 1]; // Oldest purchase

        return {
          propertyId: property.id,
          propertyTitle: property.title,
          propertyAddress: property.address,
          propertyType: property.property_type,
          propertyValuation: property.valuation,
          propertyImages: property.property_images,
          totalTokens: tokenInfo?.total_tokens || 0,
          availableTokens: tokenInfo?.available_tokens || 0,
          pricePerToken: tokenInfo?.price_per_token || 0,
          userTokens,
          totalInvested,
          firstPurchaseDate: firstPurchase?.purchased_at,
          purchases: propertyPurchases.map(p => ({
            date: p.purchased_at,
            tokens: p.tokens_purchased,
            amount: p.total_amount,
          })),
        };
      }) || [];

      setInvestments(investmentsData);
    } catch (error: any) {
      console.error("Error loading investments:", error);
      toast({
        title: "Error loading investments",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredInvestments = investments.filter(investment =>
    searchQuery === "" ||
    investment.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    investment.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = (investment: Investment) => {
    setSelectedInvestment(investment);
    setDetailsOpen(true);
  };

  const getTotalPortfolioValue = () => {
    return investments.reduce((sum, inv) => {
      const currentValue = (inv.propertyValuation * inv.userTokens) / inv.totalTokens;
      return sum + currentValue;
    }, 0);
  };

  const getTotalInvested = () => {
    return investments.reduce((sum, inv) => sum + inv.totalInvested, 0);
  };

  const getOverallROI = () => {
    const totalInvested = getTotalInvested();
    const totalValue = getTotalPortfolioValue();
    if (totalInvested === 0) return 0;
    return ((totalValue - totalInvested) / totalInvested) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Investments</h2>
        <p className="text-muted-foreground">Track and manage your property token portfolio</p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-normal text-muted-foreground">Total Invested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {getTotalInvested().toLocaleString("en-US", { 
                style: "currency", 
                currency: "USD",
                maximumFractionDigits: 0
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {investments.length} {investments.length === 1 ? "property" : "properties"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-normal text-muted-foreground">Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {getTotalPortfolioValue().toLocaleString("en-US", { 
                style: "currency", 
                currency: "USD",
                maximumFractionDigits: 0
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Current market value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-normal text-muted-foreground">Overall ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold flex items-center gap-2 ${getOverallROI() >= 0 ? "text-green-600" : "text-red-600"}`}>
              {getOverallROI() >= 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
              {getOverallROI() >= 0 ? "+" : ""}{getOverallROI().toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Return on investment</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search your investments by property name or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Investments Grid */}
      {filteredInvestments.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredInvestments.map((investment) => {
            const images = Array.isArray(investment.propertyImages) ? investment.propertyImages : [];
            const firstImage = images[0];
            const userOwnershipPercentage = (investment.userTokens / investment.totalTokens) * 100;
            const currentValue = (investment.propertyValuation * investment.userTokens) / investment.totalTokens;
            const profitLoss = currentValue - investment.totalInvested;
            const roi = (profitLoss / investment.totalInvested) * 100;

            return (
              <Card key={investment.propertyId} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  {firstImage ? (
                    <div className="aspect-video bg-muted relative">
                      <img
                        src={firstImage.url || firstImage}
                        alt={investment.propertyTitle}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-3 right-3 bg-background/90 backdrop-blur">
                        {userOwnershipPercentage.toFixed(2)}% ownership
                      </Badge>
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <Building className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </CardHeader>

                <CardContent className="pt-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-1">{investment.propertyTitle}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{investment.propertyAddress}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{investment.propertyType}</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Your Holdings</span>
                      <span className="font-medium">{investment.userTokens.toLocaleString()} tokens</span>
                    </div>
                    <Progress value={userOwnershipPercentage} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Invested</p>
                      <p className="font-semibold">
                        {investment.totalInvested.toLocaleString("en-US", { 
                          style: "currency", 
                          currency: "USD",
                          maximumFractionDigits: 0
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Current Value</p>
                      <p className="font-semibold">
                        {currentValue.toLocaleString("en-US", { 
                          style: "currency", 
                          currency: "USD",
                          maximumFractionDigits: 0
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">ROI</span>
                      <span className={`font-bold ${roi >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {roi >= 0 ? "+" : ""}{roi.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-0">
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={() => handleViewDetails(investment)}
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center">
            <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No investments yet</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? "No investments match your search. Try a different search term."
                : "Start building your real estate portfolio by purchasing property tokens from the Marketplace."}
            </p>
            {!searchQuery && (
              <Button onClick={() => window.location.href = "/dashboard/marketplace"}>
                Explore Marketplace
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Investment Details Dialog */}
      <InvestmentDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        investment={selectedInvestment}
      />
    </div>
  );
};

export default Investments;
