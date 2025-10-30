import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Building2, MapPin, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { InvestDialog } from "./InvestDialog";

interface Property {
  id: string;
  title: string;
  address: string;
  valuation: number;
  property_type: string;
  property_images: string[];
  property_tokens: {
    total_tokens: number;
    available_tokens: number;
    price_per_token: number;
  }[];
}

interface Portfolio {
  total_value: number;
  total_tokens: number;
  properties_count: number;
}

const BuyerDashboard = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio>({
    total_value: 0,
    total_tokens: 0,
    properties_count: 0,
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

      // Load marketplace properties
      const { data: propertiesData } = await supabase
        .from("properties")
        .select(`
          *,
          property_tokens (
            total_tokens,
            available_tokens,
            price_per_token
          )
        `)
        .eq("status", "tokenized");

      if (propertiesData) {
        setProperties(propertiesData as any);
      }

      // Load user portfolio
      const { data: purchases } = await supabase
        .from("token_purchases")
        .select("tokens_purchased, total_amount, property_id")
        .eq("buyer_id", user.data.user.id);

      if (purchases) {
        const totalValue = purchases.reduce((sum, p) => sum + Number(p.total_amount), 0);
        const totalTokens = purchases.reduce((sum, p) => sum + Number(p.tokens_purchased), 0);
        const uniqueProperties = new Set(purchases.map((p) => p.property_id)).size;

        setPortfolio({
          total_value: totalValue,
          total_tokens: totalTokens,
          properties_count: uniqueProperties,
        });
      }
    } catch (error: any) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-secondary to-accent p-8">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
            <div className="relative flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">My Investment Portfolio</h2>
                <p className="text-white/90">Track your tokenized real estate investments</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all hover:-translate-y-1">
                <CardHeader>
                  <CardDescription className="text-white/80">Total Investment Value</CardDescription>
                  <CardTitle className="text-4xl text-white">${portfolio.total_value.toLocaleString()}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-white/70">Across all properties</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all hover:-translate-y-1">
                <CardHeader>
                  <CardDescription className="text-white/80">Total Tokens Owned</CardDescription>
                  <CardTitle className="text-4xl text-white">{portfolio.total_tokens.toLocaleString()}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-white/70">Real estate tokens</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all hover:-translate-y-1">
                <CardHeader>
                  <CardDescription className="text-white/80">Properties Invested</CardDescription>
                  <CardTitle className="text-4xl text-white">{portfolio.properties_count}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-white/70">Diversified portfolio</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-3xl font-bold gradient-text">Marketplace</h3>
                <p className="text-muted-foreground text-lg">Explore tokenized properties</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.length > 0 ? (
                properties.map((property) => {
                  const tokens = property.property_tokens[0];
                  const images = property.property_images || [];
                  return (
                    <Card key={property.id} className="border-2 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all hover:-translate-y-1 overflow-hidden group">
                      <div className="relative">
                        {images.length > 0 ? (
                          <Carousel className="w-full">
                            <CarouselContent>
                              {images.map((img, idx) => (
                                <CarouselItem key={idx}>
                                  <div className="relative">
                                    <img
                                      src={img}
                                      alt={`${property.title} - Image ${idx + 1}`}
                                      className="w-full h-64 object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                  </div>
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            {images.length > 1 && (
                              <>
                                <CarouselPrevious className="left-2 bg-background/80 backdrop-blur-sm border-0 hover:bg-background/95" />
                                <CarouselNext className="right-2 bg-background/80 backdrop-blur-sm border-0 hover:bg-background/95" />
                              </>
                            )}
                          </Carousel>
                        ) : (
                          <div className="w-full h-64 bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                            <Building2 className="h-16 w-16 text-accent/40" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <div className="px-4 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold capitalize shadow-lg backdrop-blur-sm">
                            {property.property_type}
                          </div>
                        </div>
                      </div>
                      <CardHeader>
                        <CardTitle className="line-clamp-1">{property.title}</CardTitle>
                        <CardDescription className="flex items-start gap-1">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-1">{property.address}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="bg-accent-light p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-muted-foreground">Property Value</span>
                              <span className="text-lg font-bold text-accent">${Number(property.valuation).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">Total Tokens</span>
                              <span className="font-medium">{tokens ? Number(tokens.total_tokens).toLocaleString() : '0'}</span>
                            </div>
                          </div>
                          
                          {tokens && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Available:</span>
                                <span className="font-semibold text-foreground">{Number(tokens.available_tokens).toLocaleString()} tokens</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-accent h-2 rounded-full transition-all"
                                  style={{
                                    width: `${((tokens.total_tokens - tokens.available_tokens) / tokens.total_tokens) * 100}%`,
                                  }}
                                />
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{Math.round(((tokens.total_tokens - tokens.available_tokens) / tokens.total_tokens) * 100)}% sold</span>
                                <span>{tokens.available_tokens} left</span>
                              </div>
                            </div>
                          )}

                          <div className="pt-2 border-t border-border">
                            <div className="flex justify-between items-baseline">
                              <span className="text-sm text-muted-foreground">Price per Token</span>
                              <span className="text-xl font-bold text-accent">${tokens ? Number(tokens.price_per_token).toFixed(2) : '0'}</span>
                            </div>
                          </div>
                          
                          <Button 
                            className="w-full mt-2 bg-gradient-to-r from-accent to-accent-dark hover:from-accent-dark hover:to-accent" 
                            size="lg"
                            onClick={() => {
                              setSelectedProperty(property);
                              setInvestDialogOpen(true);
                            }}
                            disabled={!tokens || tokens.available_tokens === 0}
                          >
                            {tokens && tokens.available_tokens > 0 ? "Invest Now" : "Sold Out"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full">
                  <Card className="border-2 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <Building2 className="h-16 w-16 text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Properties Available</h3>
                      <p className="text-muted-foreground text-center">Check back soon for new investment opportunities</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <InvestDialog
        property={selectedProperty}
        open={investDialogOpen}
        onOpenChange={setInvestDialogOpen}
        onSuccess={loadData}
      />
    </div>
  );
};

export default BuyerDashboard;