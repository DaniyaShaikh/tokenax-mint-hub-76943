import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { MapPin, Building, DollarSign, Coins, TrendingUp, ShoppingCart } from "lucide-react";

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

interface MarketplacePropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: Property | null;
  onInvest: () => void;
}

const MarketplacePropertyDialog = ({ 
  open, 
  onOpenChange, 
  property,
  onInvest 
}: MarketplacePropertyDialogProps) => {
  if (!property) return null;

  const images = Array.isArray(property.property_images) ? property.property_images : [];
  const soldTokens = property.total_tokens - property.available_tokens;
  const fundingProgress = (soldTokens / property.total_tokens) * 100;
  const highlights = property.highlights 
    ? property.highlights.split('\n').filter(h => h.trim()) 
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Property Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Images Carousel */}
          {images.length > 0 && (
            <Carousel className="w-full">
              <CarouselContent>
                {images.map((img: any, idx: number) => (
                  <CarouselItem key={idx}>
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
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
                  <CarouselPrevious />
                  <CarouselNext />
                </>
              )}
            </Carousel>
          )}

          {/* Property Header */}
          <div>
            <h2 className="text-3xl font-bold mb-2">{property.title}</h2>
            <p className="text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {property.address}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="secondary" className="gap-1">
                <Building className="h-3 w-3" />
                {property.property_type}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <DollarSign className="h-3 w-3" />
                {property.valuation.toLocaleString("en-US", { 
                  style: "currency", 
                  currency: "USD",
                  maximumFractionDigits: 0
                })}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Token Information */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Coins className="h-4 w-4" />
                Price per Token
              </div>
              <p className="text-2xl font-bold">
                {property.price_per_token.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                Available Tokens
              </div>
              <p className="text-2xl font-bold">{property.available_tokens.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">
                of {property.total_tokens.toLocaleString()} total
              </p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                Total Raised
              </div>
              <p className="text-2xl font-bold">
                {(soldTokens * property.price_per_token).toLocaleString("en-US", { 
                  style: "currency", 
                  currency: "USD",
                  maximumFractionDigits: 0
                })}
              </p>
            </div>
          </div>

          {/* Funding Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Funding Progress</span>
              <span className="text-muted-foreground">{fundingProgress.toFixed(1)}%</span>
            </div>
            <Progress value={fundingProgress} className="h-3" />
          </div>

          <Separator />

          {/* Description */}
          {property.description && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{property.description}</p>
            </div>
          )}

          {/* Highlights */}
          {highlights.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Property Highlights</h3>
              <ul className="space-y-2">
                {highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Separator />

          {/* Investment Summary */}
          <div className="bg-primary/10 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Investment Opportunity</h3>
            <p className="text-sm text-muted-foreground">
              This property has been tokenized into {property.total_tokens.toLocaleString()} tokens at{" "}
              {property.price_per_token.toLocaleString("en-US", { style: "currency", currency: "USD" })} per token.
              Currently, {property.available_tokens.toLocaleString()} tokens are available for purchase.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button 
              className="flex-1 gap-2" 
              onClick={onInvest}
              disabled={property.available_tokens === 0}
            >
              <ShoppingCart className="h-4 w-4" />
              Purchase Tokens
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MarketplacePropertyDialog;
