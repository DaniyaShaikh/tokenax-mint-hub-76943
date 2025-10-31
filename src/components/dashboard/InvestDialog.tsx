import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Wallet, AlertCircle, CheckCircle, TrendingUp, Coins } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface InvestDialogProps {
  property: {
    id: string;
    title: string;
    valuation: number;
    property_tokens: {
      available_tokens: number;
      price_per_token: number;
    }[];
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const InvestDialog = ({ property, open, onOpenChange, onSuccess }: InvestDialogProps) => {
  const [tokens, setTokens] = useState(1);
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(100000); // Mock wallet balance - in real app, fetch from DB

  useEffect(() => {
    if (open) {
      loadWalletBalance();
    }
  }, [open]);

  const loadWalletBalance = async () => {
    // In a real application, fetch wallet balance from database
    // For now, using mock data
    setWalletBalance(100000); // $100,000 mock balance
  };

  if (!property || !property.property_tokens[0]) return null;

  const tokenData = property.property_tokens[0];
  const pricePerToken = Number(tokenData.price_per_token);
  const totalCost = tokens * pricePerToken;
  const maxTokens = tokenData.available_tokens;
  const hasSufficientBalance = walletBalance >= totalCost;
  const ownershipPercentage = (tokens / (tokenData.available_tokens + tokens)) * 100;

  const handleTokenChange = (value: string) => {
    const newTokens = parseInt(value) || 1;
    setTokens(Math.max(1, Math.min(maxTokens, newTokens)));
  };

  const setQuickAmount = (percentage: number) => {
    const amount = Math.floor(maxTokens * percentage);
    setTokens(Math.max(1, amount));
  };

  const handlePurchase = async () => {
    if (tokens <= 0 || tokens > tokenData.available_tokens) {
      toast.error("Invalid number of tokens");
      return;
    }

    if (!hasSufficientBalance) {
      toast.error("Insufficient wallet balance");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to purchase tokens");
        return;
      }

      const totalAmount = tokens * pricePerToken;

      // Record the token purchase
      const { error: purchaseError } = await supabase.from("token_purchases").insert({
        buyer_id: user.id,
        property_id: property.id,
        tokens_purchased: tokens,
        total_amount: totalAmount,
        price_per_token: pricePerToken,
      });

      if (purchaseError) throw purchaseError;

      // Update available tokens
      const newAvailableTokens = tokenData.available_tokens - tokens;
      const { error: updateError } = await supabase
        .from("property_tokens")
        .update({ available_tokens: newAvailableTokens })
        .eq("property_id", property.id);

      if (updateError) throw updateError;

      // In a real app, deduct from wallet balance here
      // await deductFromWallet(user.id, totalAmount);

      toast.success(
        `Successfully purchased ${tokens.toLocaleString()} tokens for $${totalAmount.toLocaleString()}!`,
        { 
          duration: 5000,
          icon: <CheckCircle className="h-5 w-5" />
        }
      );
      
      onOpenChange(false);
      onSuccess();
      setTokens(1); // Reset
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast.error(error.message || "Failed to process purchase");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Purchase Property Tokens
          </DialogTitle>
          <DialogDescription>
            Invest in <span className="font-semibold text-foreground">{property.title}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Wallet Balance Card */}
          <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available Balance</p>
                  <p className="text-2xl font-bold">
                    ${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                Add Funds
              </Button>
            </div>
          </Card>

          {/* Token Input */}
          <div className="space-y-3">
            <Label htmlFor="tokens" className="text-base font-semibold">Number of Tokens</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="tokens"
                  type="number"
                  min="1"
                  max={maxTokens}
                  value={tokens}
                  onChange={(e) => handleTokenChange(e.target.value)}
                  className="text-xl font-semibold h-14"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setQuickAmount(0.25)}
                  className="px-3"
                >
                  25%
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setQuickAmount(0.5)}
                  className="px-3"
                >
                  50%
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setQuickAmount(1)}
                  className="px-3"
                >
                  Max
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Available: <span className="font-semibold text-foreground">{maxTokens.toLocaleString()}</span> tokens
              </span>
              <span className="text-muted-foreground">
                @ <span className="font-semibold text-foreground">${pricePerToken.toFixed(2)}</span>/token
              </span>
            </div>
          </div>

          {/* Ownership Indicator */}
          <Card className="p-4 bg-muted/30">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  Your Ownership
                </span>
                <span className="font-semibold text-lg">{ownershipPercentage.toFixed(3)}%</span>
              </div>
              <Progress value={ownershipPercentage} className="h-2" />
            </div>
          </Card>

          {/* Cost Breakdown */}
          <Card className="p-4 space-y-3 border-2">
            <h4 className="font-semibold text-sm text-muted-foreground">Purchase Summary</h4>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Token Quantity</span>
                <span className="font-semibold">{tokens.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Price per Token</span>
                <span className="font-semibold">${pricePerToken.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Property Valuation</span>
                <span className="font-semibold">${property.valuation.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-3 border-t-2 border-border">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Amount</span>
                <span className="text-3xl font-bold text-primary">
                  ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              {!hasSufficientBalance && (
                <p className="text-sm text-destructive mt-2 text-right">
                  Insufficient balance: Need ${(totalCost - walletBalance).toLocaleString()} more
                </p>
              )}
            </div>
          </Card>

          {/* Balance Warning */}
          {!hasSufficientBalance && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You don't have enough balance to complete this purchase. 
                Please add funds to your wallet or reduce the number of tokens.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 h-12"
              onClick={handlePurchase}
              disabled={loading || !hasSufficientBalance}
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  <Wallet className="h-4 w-4 mr-2" />
                  Purchase Now
                </>
              )}
            </Button>
          </div>

          {/* Additional Info */}
          <div className="bg-muted/30 p-4 rounded-lg border">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground space-y-1">
                <p>✓ Instant token ownership transfer</p>
                <p>✓ Payment deducted from wallet balance</p>
                <p>✓ Receive proportional property returns</p>
                <p>✓ Full transaction history available</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
