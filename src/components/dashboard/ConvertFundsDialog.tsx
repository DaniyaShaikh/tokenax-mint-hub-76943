import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowDownUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ConvertFundsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ConvertFundsDialog = ({ open, onOpenChange }: ConvertFundsDialogProps) => {
  const [fromCurrency, setFromCurrency] = useState<"USD" | "CAD">("USD");
  const [toCurrency, setToCurrency] = useState<"USD" | "CAD">("CAD");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  
  // Mock exchange rate
  const exchangeRate = fromCurrency === "USD" ? 1.35 : 0.74;

  useEffect(() => {
    if (fromAmount) {
      const converted = (parseFloat(fromAmount) * exchangeRate).toFixed(2);
      setToAmount(converted);
    } else {
      setToAmount("");
    }
  }, [fromAmount, exchangeRate]);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount(toAmount);
  };

  const handleConvert = () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast({ 
        description: "Please enter a valid amount", 
        variant: "destructive" 
      });
      return;
    }
    toast({ description: "Conversion completed successfully" });
    onOpenChange(false);
    setFromAmount("");
    setToAmount("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Convert Funds</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Exchange Rate Display */}
          <div className="bg-muted p-4 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Current Exchange Rate</p>
            <p className="text-2xl font-bold mt-1">
              1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Updated just now</p>
          </div>

          {/* From Currency */}
          <div className="space-y-2">
            <Label htmlFor="from-amount">From</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="from-amount"
                  type="number"
                  placeholder="0.00"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="text-lg"
                />
              </div>
              <div className="w-24">
                <Button
                  variant="outline"
                  className="w-full h-full"
                  disabled
                >
                  {fromCurrency === "USD" ? "🇺🇸 USD" : "🇨🇦 CAD"}
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Available: $0.00 {fromCurrency}</p>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={swapCurrencies}
            >
              <ArrowDownUp className="h-4 w-4" />
            </Button>
          </div>

          {/* To Currency */}
          <div className="space-y-2">
            <Label htmlFor="to-amount">To</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="to-amount"
                  type="number"
                  placeholder="0.00"
                  value={toAmount}
                  readOnly
                  className="text-lg bg-muted"
                />
              </div>
              <div className="w-24">
                <Button
                  variant="outline"
                  className="w-full h-full"
                  disabled
                >
                  {toCurrency === "USD" ? "🇺🇸 USD" : "🇨🇦 CAD"}
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">You'll receive approximately {toAmount} {toCurrency}</p>
          </div>

          {/* Conversion Details */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Exchange Rate</span>
              <span className="font-medium">1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fee</span>
              <span className="font-medium">$0.00</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2">
              <span className="font-medium">Total</span>
              <span className="font-bold">{toAmount || "0.00"} {toCurrency}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleConvert}>
              Convert Now
            </Button>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center">
            Exchange rates are updated in real-time and may fluctuate. The final conversion rate will be determined at the time of transaction.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConvertFundsDialog;
