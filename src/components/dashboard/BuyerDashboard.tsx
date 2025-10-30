import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Building2, TrendingUp, Wallet, MapPin, Coins } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { InvestDialog } from "./InvestDialog";

interface Property {
  id: string;
  title: string;
  address: string;
  valuation: number;
  property_type: string;
  property_images: any;
  description?: string;
  highlights?: string;
  property_tokens: Array<{
    total_tokens: number;
    available_tokens: number;
    price_per_token: number;
  }>;
}

interface Portfolio {
  totalValue: number;
  totalTokens: number;
  propertiesCount: number;
  investments: Array<{
    property_title: string;
    tokens: number;
    value: number;
  }>;
}

const BuyerDashboard = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio>({
    totalValue: 0,
    totalTokens: 0,
    propertiesCount: 0,
    investments: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [investDialogOpen, setInvestDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      const { data: propertiesData } = await supabase
        .from("properties")
        .select(`*, property_tokens (total_tokens, available_tokens, price_per_token)`)
        .eq("status", "tokenized");

      if (propertiesData && propertiesData.length > 0) {
        const mappedProperties = propertiesData.map((prop: any) => ({
          ...prop,
          property_tokens: prop.property_tokens ? [prop.property_tokens] : [],
          property_images: Array.isArray(prop.property_images) ? prop.property_images : []
        }));
        setProperties(mappedProperties);
      } else {
        // Show sample properties for new users
        const sampleProperties: Property[] = [
          {
            id: "sample-1",
            title: "Luxury Downtown Apartment",
            address: "123 Main Street, New York, NY",
            valuation: 850000,
            property_type: "Residential",
            property_images: [],
            description: "Modern luxury apartment in the heart of downtown with stunning city views and premium amenities.",
            highlights: "Prime location, 24/7 concierge, rooftop pool, gym access",
            property_tokens: [{
              total_tokens: 10000,
              available_tokens: 3500,
              price_per_token: 85
            }]
          },
          {
            id: "sample-2",
            title: "Commercial Office Complex",
            address: "456 Business Ave, Chicago, IL",
            valuation: 1200000,
            property_type: "Commercial",
            property_images: [],
            description: "Grade A office space in prime business district with excellent transport links.",
            highlights: "High occupancy rate, premium tenants, modern facilities",
            property_tokens: [{
              total_tokens: 15000,
              available_tokens: 8000,
              price_per_token: 80
            }]
          }
        ];
        setProperties(sampleProperties);
      }

      const { data: purchases } = await supabase
        .from("token_purchases")
        .select(`tokens_purchased, total_amount, property_id, properties (title)`)
        .eq("buyer_id", user.data.user.id);

      if (purchases && purchases.length > 0) {
        const totalValue = purchases.reduce((sum, p) => sum + Number(p.total_amount), 0);
        const totalTokens = purchases.reduce((sum, p) => sum + p.tokens_purchased, 0);
        const uniqueProperties = new Set(purchases.map(p => p.property_id));

        const investmentMap = new Map();
        purchases.forEach(p => {
          if (!investmentMap.has(p.property_id)) {
            investmentMap.set(p.property_id, {
              property_title: (p.properties as any)?.title || "Unknown",
              tokens: 0,
              value: 0,
            });
          }
          const inv = investmentMap.get(p.property_id);
          inv.tokens += p.tokens_purchased;
          inv.value += Number(p.total_amount);
        });

        setPortfolio({
          totalValue,
          totalTokens,
          propertiesCount: uniqueProperties.size,
          investments: Array.from(investmentMap.values()),
        });
      } else {
        // Show sample portfolio for new users
        setPortfolio({
          totalValue: 42500,
          totalTokens: 500,
          propertiesCount: 2,
          investments: [
            {
              property_title: "Tech Hub Office Building",
              tokens: 300,
              value: 25500
            },
            {
              property_title: "Beachfront Condo Complex",
              tokens: 200,
              value: 17000
            }
          ]
        });
      }
    } catch (error: any) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvest = (property: Property) => {
    setSelectedProperty(property);
    setInvestDialogOpen(true);
  };

  if (loading) {
    return <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">My Portfolio</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle><Wallet className="h-5 w-5 text-accent" /></CardHeader><CardContent><div className="text-3xl font-bold">${portfolio.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div><p className="text-xs text-muted-foreground mt-1">Across {portfolio.propertiesCount} properties</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Tokens</CardTitle><TrendingUp className="h-5 w-5 text-accent" /></CardHeader><CardContent><div className="text-3xl font-bold">{portfolio.totalTokens.toLocaleString()}</div><p className="text-xs text-muted-foreground mt-1">Property ownership tokens</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Properties</CardTitle><Building2 className="h-5 w-5 text-accent" /></CardHeader><CardContent><div className="text-3xl font-bold">{portfolio.propertiesCount}</div><p className="text-xs text-muted-foreground mt-1">Diversified investments</p></CardContent></Card>
        </div>

        {portfolio.investments.length > 0 && (
          <Card className="mt-6"><CardHeader><CardTitle>My Investments</CardTitle><CardDescription>Properties you've invested in</CardDescription></CardHeader><CardContent><div className="space-y-4">{portfolio.investments.map((inv, idx) => (<div key={idx} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"><div className="flex items-center gap-3"><Building2 className="h-8 w-8 text-accent" /><div><p className="font-semibold">{inv.property_title}</p><p className="text-sm text-muted-foreground">{inv.tokens} tokens owned</p></div></div><div className="text-right"><p className="text-lg font-bold">${inv.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p><p className="text-xs text-muted-foreground">Investment value</p></div></div>))}</div></CardContent></Card>
        )}
      </div>

      <div><h2 className="text-2xl font-bold mb-6">Available Properties</h2>{properties.length === 0 ? (<Card><CardContent className="py-12 text-center"><Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No properties available for investment</p></CardContent></Card>) : (<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{properties.map((property) => {
        const tokenData = property.property_tokens[0];
        if (!tokenData) return null;
        const tokensAvailable = tokenData.available_tokens;
        const totalTokens = tokenData.total_tokens;
        const percentageSold = ((totalTokens - tokensAvailable) / totalTokens) * 100;

        return (
          <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <Carousel className="w-full">
              <CarouselContent>
                {property.property_images && property.property_images.length > 0 ? (
                  property.property_images.map((image: string, idx: number) => (
                    <CarouselItem key={idx}>
                      <div className="aspect-video relative">
                        <img src={image} alt={`${property.title} - Image ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    </CarouselItem>
                  ))
                ) : (
                  <CarouselItem>
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <Building2 className="h-12 w-12 text-muted-foreground" />
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>
              {property.property_images && property.property_images.length > 1 && (
                <>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </>
              )}
            </Carousel>
            <CardContent className="p-6">
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg">{property.title}</h3>
                  <Badge variant="secondary">{property.property_type}</Badge>
                </div>
                <div className="flex items-start gap-1 text-sm text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{property.address}</span>
                </div>
                {property.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{property.description}</p>
                )}
                <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Property Value</span>
                    <span className="font-bold text-lg">${Number(property.valuation).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Coins className="h-4 w-4" />Price per Token
                    </span>
                    <span className="font-semibold">${Number(tokenData.price_per_token).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Available</span>
                    <span className="font-semibold text-accent">{tokensAvailable.toLocaleString()} / {totalTokens.toLocaleString()}</span>
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>Funding Progress</span>
                      <span className="font-medium">{percentageSold.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${percentageSold}%` }} />
                    </div>
                  </div>
                </div>
                {property.highlights && (
                  <div className="mt-4 text-xs text-muted-foreground bg-accent-light p-3 rounded">
                    <p className="font-medium mb-1">Key Highlights:</p>
                    <p className="line-clamp-2">{property.highlights}</p>
                  </div>
                )}
              </div>
              <Button className="w-full" onClick={() => handleInvest(property)} disabled={tokensAvailable === 0}>
                {tokensAvailable === 0 ? "Sold Out" : "Invest Now"}
              </Button>
            </CardContent>
          </Card>
        );
      })}</div>)}</div>

      <InvestDialog property={selectedProperty} open={investDialogOpen} onOpenChange={setInvestDialogOpen} onSuccess={loadData} />
    </div>
  );
};

export default BuyerDashboard;
