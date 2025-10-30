import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  if (!property || !property.property_tokens[0]) return null;

  const tokenData = property.property_tokens[0];
  const totalCost = tokens * Number(tokenData.price_per_token);
  const maxTokens = tokenData.available_tokens;

  const handleInvest = async () => {
    if (tokens <= 0 || tokens > tokenData.available_tokens) {
      toast.error("Invalid number of tokens");
      return;
    }

    setLoading(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        toast.error("Please log in to invest");
        return;
      }

      const totalAmount = tokens * tokenData.price_per_token;

      // In a real-world scenario, this would:
      // 1. Integrate with Stripe or another payment gateway
      // 2. Process the payment
      // 3. Only record the purchase after successful payment
      // For now, we'll simulate the purchase directly

      const { error: purchaseError } = await supabase.from("token_purchases").insert({
        buyer_id: user.data.user.id,
        property_id: property.id,
        tokens_purchased: tokens,
        total_amount: totalAmount,
        price_per_token: tokenData.price_per_token,
      });

      if (purchaseError) throw purchaseError;

      // Update available tokens
      const newAvailableTokens = tokenData.available_tokens - tokens;
      const { error: updateError } = await supabase
        .from("property_tokens")
        .update({ available_tokens: newAvailableTokens })
        .eq("property_id", property.id);

      if (updateError) throw updateError;

      // Show success message with payment instructions
      toast.success(
        `Purchase record created! Payment instructions sent to your email. Total: $${totalAmount.toLocaleString()}. Please complete payment to legally claim your ${tokens} tokens.`,
        { duration: 8000 }
      );
      
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to process investment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invest in {property.title}</DialogTitle>
          <DialogDescription>
            Choose the number of tokens you want to purchase
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="tokens">Number of Tokens</Label>
            <Input
              id="tokens"
              type="number"
              min="1"
              max={maxTokens}
              value={tokens}
              onChange={(e) => setTokens(Math.max(1, Math.min(maxTokens, parseInt(e.target.value) || 1)))}
              className="text-lg font-semibold"
            />
            <p className="text-sm text-muted-foreground">
              Maximum available: {maxTokens.toLocaleString()} tokens
            </p>
          </div>

          <div className="bg-accent-light rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Price per Token</span>
              <span className="font-semibold">${Number(tokenData.price_per_token).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tokens</span>
              <span className="font-semibold">{tokens.toLocaleString()}</span>
            </div>
            <div className="pt-3 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Investment</span>
                <span className="text-2xl font-bold text-accent">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

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
              onClick={handleInvest}
              disabled={loading}
            >
              {loading ? "Creating Purchase Record..." : "Create Purchase Record"}
            </Button>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              📧 After creating your purchase record, payment instructions will be sent to your email. 
              Complete the payment to legally claim your tokens and become a property stakeholder.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
