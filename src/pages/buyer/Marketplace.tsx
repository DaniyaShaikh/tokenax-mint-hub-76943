import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Search, MapPin, TrendingUp, Clock, ShoppingCart } from "lucide-react";
import MarketplacePropertyDialog from "@/components/dashboard/MarketplacePropertyDialog";
import PropertyPurchaseDialog from "@/components/dashboard/PropertyPurchaseDialog";
import { toast } from "@/hooks/use-toast";

interface Property {
  id: string;
  title: string;
  address: string;
  valuation: number;
  property_type: string;
  description: string | null;
  highlights: string | null;
  property_images: any;
  total_tokens: number;
  available_tokens: number;
  price_per_token: number;
}

const Marketplace = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      
      // Fetch tokenized properties with their token details
      const { data: propertiesData, error: propertiesError } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "tokenized")
        .order("created_at", { ascending: false });

      if (propertiesError) throw propertiesError;

      if (propertiesData && propertiesData.length > 0) {
        // Fetch token information for each property
        const propertyIds = propertiesData.map(p => p.id);
        const { data: tokensData, error: tokensError } = await supabase
          .from("property_tokens")
          .select("*")
          .in("property_id", propertyIds);

        if (tokensError) throw tokensError;

        // Combine property and token data
        const combinedData = propertiesData.map(property => {
          const tokenInfo = tokensData?.find(t => t.property_id === property.id);
          return {
            id: property.id,
            title: property.title,
            address: property.address,
            valuation: property.valuation,
            property_type: property.property_type,
            description: property.description,
            highlights: property.highlights,
            property_images: property.property_images,
            total_tokens: tokenInfo?.total_tokens || 0,
            available_tokens: tokenInfo?.available_tokens || 0,
            price_per_token: tokenInfo?.price_per_token || 0,
          };
        });

        setProperties(combinedData);
      }
    } catch (error: any) {
      console.error("Error loading properties:", error);
      toast({
        title: "Error loading properties",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      searchQuery === "" ||
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.property_type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === "all" || property.property_type === typeFilter;

    return matchesSearch && matchesType;
  });

  const handleViewDetails = (property: Property) => {
    setSelectedProperty(property);
    setDetailsOpen(true);
  };

  const handleBuyTokens = (property: Property) => {
    setSelectedProperty(property);
    setPurchaseOpen(true);
  };

  const getFundingProgress = (property: Property) => {
    const soldTokens = property.total_tokens - property.available_tokens;
    return (soldTokens / property.total_tokens) * 100;
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
        <h2 className="text-3xl font-bold tracking-tight">Marketplace</h2>
        <p className="text-muted-foreground">Browse and invest in tokenized real estate properties</p>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties by name, location, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Residential">Residential</SelectItem>
              <SelectItem value="Commercial">Commercial</SelectItem>
              <SelectItem value="Industrial">Industrial</SelectItem>
              <SelectItem value="Mixed-Use">Mixed-Use</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredProperties.length} of {properties.length} properties
        </div>
      </Card>

      {/* Property Grid */}
      {filteredProperties.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((property) => {
            const images = Array.isArray(property.property_images) 
              ? property.property_images 
              : [];
            const fundingProgress = getFundingProgress(property);

            return (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  {images.length > 0 ? (
                    <Carousel className="w-full">
                      <CarouselContent>
                        {images.map((img: any, idx: number) => (
                          <CarouselItem key={idx}>
                            <div className="aspect-video bg-muted relative">
                              <img
                                src={img.url || img}
                                alt={`${property.title} - ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      {images.length > 1 && (
                        <>
                          <CarouselPrevious className="left-2" />
                          <CarouselNext className="right-2" />
                        </>
                      )}
                    </Carousel>
                  ) : (
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <MapPin className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </CardHeader>

                <CardContent className="pt-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {property.address}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{property.property_type}</Badge>
                    <Badge variant="outline" className="gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {property.valuation.toLocaleString("en-US", { 
                        style: "currency", 
                        currency: "USD",
                        maximumFractionDigits: 0
                      })}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Funding Progress</span>
                      <span className="font-medium">{fundingProgress.toFixed(1)}%</span>
                    </div>
                    <Progress value={fundingProgress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Price per Token</p>
                      <p className="font-semibold">
                        {property.price_per_token.toLocaleString("en-US", { 
                          style: "currency", 
                          currency: "USD" 
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Available</p>
                      <p className="font-semibold">{property.available_tokens.toLocaleString()} tokens</p>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex gap-2 pt-0">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleViewDetails(property)}
                  >
                    View Details
                  </Button>
                  <Button 
                    className="flex-1 gap-2"
                    onClick={() => handleBuyTokens(property)}
                    disabled={property.available_tokens === 0}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Buy Tokens
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No properties available</h3>
            <p className="text-muted-foreground">
              {searchQuery || typeFilter !== "all" 
                ? "No properties match your filters. Try adjusting your search."
                : "There are currently no tokenized properties available. Check back soon!"}
            </p>
          </div>
        </Card>
      )}

      {/* Dialogs */}
      <MarketplacePropertyDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        property={selectedProperty}
        onInvest={() => {
          setDetailsOpen(false);
          if (selectedProperty) {
            handleBuyTokens(selectedProperty);
          }
        }}
      />
      <PropertyPurchaseDialog
        open={purchaseOpen}
        onOpenChange={setPurchaseOpen}
        property={selectedProperty}
        onPurchaseSuccess={loadProperties}
      />
    </div>
  );
};

export default Marketplace;
