import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

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

interface PropertyPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: Property | null;
  onPurchaseSuccess: () => void;
}

const PropertyPurchaseDialog = ({ 
  open, 
  onOpenChange, 
  property,
  onPurchaseSuccess 
}: PropertyPurchaseDialogProps) => {
  const [tokenAmount, setTokenAmount] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  if (!property) return null;

  const totalCost = tokenAmount * property.price_per_token;
  const maxTokens = Math.min(property.available_tokens, 1000); // Cap at 1000 for safety

  const handlePurchase = async () => {
    if (tokenAmount < 1 || tokenAmount > property.available_tokens) {
      toast({
        title: "Invalid amount",
        description: `Please enter a number between 1 and ${property.available_tokens}`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to purchase tokens",
          variant: "destructive",
        });
        return;
      }

      // Insert token purchase
      const { error: purchaseError } = await supabase
        .from("token_purchases")
        .insert({
          buyer_id: user.id,
          property_id: property.id,
          tokens_purchased: tokenAmount,
          price_per_token: property.price_per_token,
          total_amount: totalCost,
        });

      if (purchaseError) throw purchaseError;

      // Update available tokens
      const { error: updateError } = await supabase
        .from("property_tokens")
        .update({
          available_tokens: property.available_tokens - tokenAmount,
        })
        .eq("property_id", property.id);

      if (updateError) throw updateError;

      toast({
        title: "Purchase successful!",
        description: `You've successfully purchased ${tokenAmount} tokens of ${property.title}`,
      });

      onPurchaseSuccess();
      onOpenChange(false);
      setTokenAmount(1);
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast({
        title: "Purchase failed",
        description: error.message || "An error occurred during the purchase",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Purchase Property Tokens</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Summary */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{property.address}</p>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">{property.property_type}</Badge>
              <span className="text-sm">
                Valuation: {property.valuation.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </span>
            </div>
          </div>

          <Separator />

          {/* Token Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Price per Token</p>
              <p className="text-2xl font-bold">
                {property.price_per_token.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Available Tokens</p>
              <p className="text-2xl font-bold">{property.available_tokens.toLocaleString()}</p>
            </div>
          </div>

          {/* Purchase Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="token-amount">Number of Tokens</Label>
              <Input
                id="token-amount"
                type="number"
                min="1"
                max={maxTokens}
                value={tokenAmount}
                onChange={(e) => setTokenAmount(Math.max(1, parseInt(e.target.value) || 1))}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum: {property.available_tokens.toLocaleString()} tokens
              </p>
            </div>

            {/* Quick Selection Buttons */}
            <div className="flex gap-2">
              {[10, 25, 50, 100].map((amount) => (
                amount <= property.available_tokens && (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setTokenAmount(amount)}
                  >
                    {amount}
                  </Button>
                )
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTokenAmount(property.available_tokens)}
              >
                Max
              </Button>
            </div>
          </div>

          <Separator />

          {/* Total Cost */}
          <div className="bg-primary/10 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">Tokens</span>
              <span className="font-medium">{tokenAmount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">Price per Token</span>
              <span className="font-medium">
                {property.price_per_token.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </span>
            </div>
            <Separator className="my-3" />
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Total Cost</span>
              <span className="text-2xl font-bold">
                {totalCost.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handlePurchase}
              disabled={loading || tokenAmount < 1 || tokenAmount > property.available_tokens}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Purchase ${tokenAmount} Token${tokenAmount !== 1 ? 's' : ''}`
              )}
            </Button>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center">
            By purchasing, you agree to the terms and conditions. This is a real estate tokenization transaction and is subject to applicable regulations.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyPurchaseDialog;
