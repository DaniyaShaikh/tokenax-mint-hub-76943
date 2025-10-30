import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, CreditCard as CreditCardIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AddMoneyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type CardType = "visa" | "mastercard" | "amex" | null;

const AddMoneyDialog = ({ open, onOpenChange }: AddMoneyDialogProps) => {
  const [currency, setCurrency] = useState<"USD" | "CAD">("USD");
  const [showCardForm, setShowCardForm] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardType>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ description: "Copied to clipboard" });
  };

  const resetCardFlow = () => {
    setShowCardForm(false);
    setSelectedCard(null);
  };

  const handleCurrencyChange = (value: string) => {
    setCurrency(value as "USD" | "CAD");
    resetCardFlow();
  };

  const renderUSDTabs = () => (
    <Tabs defaultValue="ach" className="w-full" onValueChange={resetCardFlow}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="ach">ACH</TabsTrigger>
        <TabsTrigger value="fedwire">Fedwire</TabsTrigger>
        <TabsTrigger value="wire">Wire (SWIFT)</TabsTrigger>
        <TabsTrigger value="card">Credit Card</TabsTrigger>
      </TabsList>

      <TabsContent value="ach" className="space-y-4">
        <div className="bg-muted p-4 rounded-lg space-y-2">
          <p className="text-sm">Use these details to receive an ACH transfer from a bank in the US.</p>
          <p className="text-sm text-muted-foreground">Pre-Authorized Debits are not supported yet</p>
        </div>
        <BankingDetails
          details={[
            { label: "Beneficiary", value: "TokenEx Inc." },
            { label: "Account Number", value: "9847562310" },
            { label: "ACH Routing Number", value: "021000021" },
            { label: "Bank", value: "First National Bank" },
            { label: "Address", value: "123 Finance Street, New York, NY 10005, US" }
          ]}
          onCopy={copyToClipboard}
        />
      </TabsContent>

      <TabsContent value="fedwire" className="space-y-4">
        <div className="bg-muted p-4 rounded-lg space-y-2">
          <p className="text-sm">Use these details to receive a Fedwire from a bank in the US.</p>
          <p className="text-sm text-muted-foreground">Pre-Authorized Debits are not supported yet</p>
        </div>
        <BankingDetails
          details={[
            { label: "Beneficiary", value: "TokenEx Inc." },
            { label: "Account Number", value: "9847562310" },
            { label: "Fedwire Routing Number", value: "026009593" },
            { label: "Bank", value: "First National Bank" },
            { label: "Address", value: "123 Finance Street, New York, NY 10005, US" }
          ]}
          onCopy={copyToClipboard}
        />
      </TabsContent>

      <TabsContent value="wire" className="space-y-4">
        <div className="bg-muted p-4 rounded-lg space-y-2">
          <p className="text-sm">Use these details to receive USD wire transfers from a bank outside of the US.</p>
          <p className="text-sm text-muted-foreground">Pre-Authorized Debits are not supported yet</p>
        </div>
        <BankingDetails
          details={[
            { label: "Beneficiary", value: "TokenEx Inc." },
            { label: "IBAN / Account Number", value: "US89TCEX0987654321098765" },
            { label: "BIC / Swift Code", value: "TCEXUS33" },
            { label: "Bank", value: "Global Transfer Bank" },
            { label: "Address", value: "456 International Way, New York, NY 10006, US" }
          ]}
          onCopy={copyToClipboard}
        />
      </TabsContent>

      <TabsContent value="card" className="space-y-4">
        {!showCardForm ? (
          <CardTypeSelector onSelect={(type) => { setSelectedCard(type); setShowCardForm(true); }} />
        ) : (
          <CreditCardForm cardType={selectedCard!} />
        )}
      </TabsContent>
    </Tabs>
  );

  const renderCADTabs = () => (
    <Tabs defaultValue="eft" className="w-full" onValueChange={resetCardFlow}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="eft">EFT</TabsTrigger>
        <TabsTrigger value="wire">Wire (SWIFT)</TabsTrigger>
        <TabsTrigger value="interac">Interac e-Transfer®</TabsTrigger>
        <TabsTrigger value="card">Credit Card</TabsTrigger>
      </TabsList>

      <TabsContent value="eft" className="space-y-4">
        <div className="bg-muted p-4 rounded-lg space-y-2">
          <p className="text-sm">Use these details to receive an EFT transfer from a bank in Canada.</p>
          <p className="text-sm text-muted-foreground">Wires (via SWIFT) sent to these details will be rejected.</p>
        </div>
        <BankingDetails
          details={[
            { label: "Beneficiary", value: "TokenEx Inc." },
            { label: "Account Number", value: "600789456123" },
            { label: "Transit Number", value: "12345" },
            { label: "Institution Number", value: "003" },
            { label: "Bank", value: "Royal Bank of Canada" },
            { label: "Address", value: "789 Bay Street, Toronto, ON M5J 2R8, Canada" }
          ]}
          onCopy={copyToClipboard}
        />
      </TabsContent>

      <TabsContent value="wire" className="space-y-4">
        <div className="bg-muted p-4 rounded-lg space-y-2">
          <p className="text-sm">Use these details to receive CAD wire transfers from Canada or internationally.</p>
          <p className="text-sm text-muted-foreground">Pre-Authorized Debits are not supported yet</p>
        </div>
        <BankingDetails
          details={[
            { label: "Beneficiary", value: "TokenEx Inc." },
            { label: "IBAN / Account Number", value: "CA67TCEX1234567890123456" },
            { label: "BIC / Swift Code", value: "TCEXCA44" },
            { label: "Bank", value: "Northern Trust Bank" },
            { label: "Address", value: "321 Wellington St, Toronto, ON M5V 3K5, Canada" }
          ]}
          onCopy={copyToClipboard}
        />
      </TabsContent>

      <TabsContent value="interac" className="space-y-4">
        <div className="bg-muted p-4 rounded-lg space-y-2">
          <p className="text-sm">Use these details to receive an Interac e-Transfer® transaction from a bank in Canada.</p>
          <p className="text-sm text-muted-foreground">Incoming payments take up to 30 minutes to be added to your account</p>
        </div>
        <BankingDetails
          details={[
            { label: "Beneficiary", value: "TokenEx Inc." },
            { label: "Email", value: "transfers@tokenex-platform.com" },
            { label: "Bank", value: "Royal Bank of Canada" },
            { label: "Address", value: "789 Bay Street, Toronto, ON M5J 2R8, Canada" },
            { label: "Note", value: "*Registered trademark of Interac Corp. Used under license." }
          ]}
          onCopy={copyToClipboard}
        />
      </TabsContent>

      <TabsContent value="card" className="space-y-4">
        {!showCardForm ? (
          <CardTypeSelector onSelect={(type) => { setSelectedCard(type); setShowCardForm(true); }} />
        ) : (
          <CreditCardForm cardType={selectedCard!} />
        )}
      </TabsContent>
    </Tabs>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add money to your account</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="currency">Select Currency</Label>
            <Select value={currency} onValueChange={handleCurrencyChange}>
              <SelectTrigger id="currency" className="w-full mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">🇺🇸 USD</SelectItem>
                <SelectItem value="CAD">🇨🇦 CAD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {currency === "USD" ? renderUSDTabs() : renderCADTabs()}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const BankingDetails = ({ details, onCopy }: { details: { label: string; value: string }[]; onCopy: (text: string) => void }) => (
  <div className="space-y-3">
    {details.map((detail, idx) => (
      <div key={idx} className="space-y-1">
        <Label className="text-xs text-muted-foreground">{detail.label}</Label>
        <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
          <span className="font-medium">{detail.value}</span>
          {detail.label !== "Note" && (
            <Button variant="ghost" size="sm" onClick={() => onCopy(detail.value)}>
              <Copy className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    ))}
  </div>
);

const CardTypeSelector = ({ onSelect }: { onSelect: (type: CardType) => void }) => (
  <div className="space-y-4">
    <p className="text-sm text-muted-foreground">Select your card type to continue</p>
    <div className="grid grid-cols-3 gap-4">
      {[
        { type: "visa" as CardType, label: "Visa" },
        { type: "mastercard" as CardType, label: "Mastercard" },
        { type: "amex" as CardType, label: "American Express" }
      ].map(card => (
        <Button
          key={card.type}
          variant="outline"
          className="h-20 flex flex-col items-center justify-center gap-2"
          onClick={() => onSelect(card.type)}
        >
          <CreditCardIcon className="h-6 w-6" />
          <span>{card.label}</span>
        </Button>
      ))}
    </div>
  </div>
);

const CreditCardForm = ({ cardType }: { cardType: CardType }) => (
  <div className="space-y-4">
    <div className="bg-primary/10 p-3 rounded-lg">
      <p className="text-sm font-medium">Selected: {cardType === "visa" ? "Visa" : cardType === "mastercard" ? "Mastercard" : "American Express"}</p>
    </div>
    <div className="space-y-4">
      <div>
        <Label htmlFor="cardName">Name on Card</Label>
        <Input id="cardName" placeholder="John Doe" className="mt-2" />
      </div>
      <div>
        <Label htmlFor="cardNumber">Card Number</Label>
        <Input id="cardNumber" placeholder="1234 5678 9012 3456" className="mt-2" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="expiry">Expiry Date</Label>
          <Input id="expiry" placeholder="MM/YY" className="mt-2" />
        </div>
        <div>
          <Label htmlFor="cvv">CVV</Label>
          <Input id="cvv" placeholder="123" className="mt-2" />
        </div>
      </div>
      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" type="number" placeholder="0.00" className="mt-2" />
      </div>
      <Button className="w-full">Add Funds</Button>
    </div>
  </div>
);

export default AddMoneyDialog;
