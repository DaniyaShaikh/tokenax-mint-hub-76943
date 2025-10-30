import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

interface SendMoneyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SendMoneyDialog = ({ open, onOpenChange }: SendMoneyDialogProps) => {
  const [currency, setCurrency] = useState<"USD" | "CAD">("USD");

  const handleSend = () => {
    toast({ description: "Transfer initiated successfully" });
    onOpenChange(false);
  };

  const renderUSDTabs = () => (
    <Tabs defaultValue="ach" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="ach">ACH</TabsTrigger>
        <TabsTrigger value="wire">Wire (SWIFT)</TabsTrigger>
        <TabsTrigger value="internal">Internal Transfer</TabsTrigger>
      </TabsList>

      <TabsContent value="ach" className="space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm">Send money via ACH to any US bank account</p>
        </div>
        <TransferForm currency="USD" method="ACH" onSubmit={handleSend} />
      </TabsContent>

      <TabsContent value="wire" className="space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm">Send international wire transfer in USD</p>
        </div>
        <WireTransferForm currency="USD" onSubmit={handleSend} />
      </TabsContent>

      <TabsContent value="internal" className="space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm">Instant transfer to another TokenEx user</p>
        </div>
        <InternalTransferForm onSubmit={handleSend} />
      </TabsContent>
    </Tabs>
  );

  const renderCADTabs = () => (
    <Tabs defaultValue="eft" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="eft">EFT</TabsTrigger>
        <TabsTrigger value="interac">Interac e-Transfer®</TabsTrigger>
        <TabsTrigger value="internal">Internal Transfer</TabsTrigger>
      </TabsList>

      <TabsContent value="eft" className="space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm">Send money via EFT to any Canadian bank account</p>
        </div>
        <TransferForm currency="CAD" method="EFT" onSubmit={handleSend} />
      </TabsContent>

      <TabsContent value="interac" className="space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm">Send via Interac e-Transfer to any email address</p>
        </div>
        <InteracTransferForm onSubmit={handleSend} />
      </TabsContent>

      <TabsContent value="internal" className="space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm">Instant transfer to another TokenEx user</p>
        </div>
        <InternalTransferForm onSubmit={handleSend} />
      </TabsContent>
    </Tabs>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Send Money</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="send-currency">Select Currency</Label>
            <Select value={currency} onValueChange={(v) => setCurrency(v as "USD" | "CAD")}>
              <SelectTrigger id="send-currency" className="w-full mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">🇺🇸 USD</SelectItem>
                <SelectItem value="CAD">🇨🇦 CAD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {currency === "USD" ? renderUSDTabs() : renderCADTabs()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const TransferForm = ({ currency, method, onSubmit }: { currency: string; method: string; onSubmit: () => void }) => (
  <div className="space-y-4">
    <div>
      <Label htmlFor="recipient-name">Recipient Name</Label>
      <Input id="recipient-name" placeholder="Enter recipient name" className="mt-2" />
    </div>
    <div>
      <Label htmlFor="account-number">Account Number</Label>
      <Input id="account-number" placeholder="Enter account number" className="mt-2" />
    </div>
    <div>
      <Label htmlFor="routing-number">{method === "EFT" ? "Transit Number" : "Routing Number"}</Label>
      <Input id="routing-number" placeholder={`Enter ${method === "EFT" ? "transit" : "routing"} number`} className="mt-2" />
    </div>
    {method === "EFT" && (
      <div>
        <Label htmlFor="institution-number">Institution Number</Label>
        <Input id="institution-number" placeholder="Enter institution number" className="mt-2" />
      </div>
    )}
    <div>
      <Label htmlFor="send-amount">Amount ({currency})</Label>
      <Input id="send-amount" type="number" placeholder="0.00" className="mt-2" />
    </div>
    <div>
      <Label htmlFor="reference">Reference (Optional)</Label>
      <Input id="reference" placeholder="Payment reference" className="mt-2" />
    </div>
    <Button className="w-full" onClick={onSubmit}>Send {currency}</Button>
  </div>
);

const WireTransferForm = ({ currency, onSubmit }: { currency: string; onSubmit: () => void }) => (
  <div className="space-y-4">
    <div>
      <Label htmlFor="wire-recipient">Recipient Name</Label>
      <Input id="wire-recipient" placeholder="Enter recipient name" className="mt-2" />
    </div>
    <div>
      <Label htmlFor="wire-iban">IBAN / Account Number</Label>
      <Input id="wire-iban" placeholder="Enter IBAN or account number" className="mt-2" />
    </div>
    <div>
      <Label htmlFor="wire-swift">BIC / SWIFT Code</Label>
      <Input id="wire-swift" placeholder="Enter SWIFT code" className="mt-2" />
    </div>
    <div>
      <Label htmlFor="wire-bank">Bank Name</Label>
      <Input id="wire-bank" placeholder="Enter bank name" className="mt-2" />
    </div>
    <div>
      <Label htmlFor="wire-address">Bank Address</Label>
      <Input id="wire-address" placeholder="Enter bank address" className="mt-2" />
    </div>
    <div>
      <Label htmlFor="wire-amount">Amount ({currency})</Label>
      <Input id="wire-amount" type="number" placeholder="0.00" className="mt-2" />
    </div>
    <Button className="w-full" onClick={onSubmit}>Send Wire Transfer</Button>
  </div>
);

const InteracTransferForm = ({ onSubmit }: { onSubmit: () => void }) => (
  <div className="space-y-4">
    <div>
      <Label htmlFor="interac-email">Recipient Email</Label>
      <Input id="interac-email" type="email" placeholder="recipient@example.com" className="mt-2" />
    </div>
    <div>
      <Label htmlFor="interac-amount">Amount (CAD)</Label>
      <Input id="interac-amount" type="number" placeholder="0.00" className="mt-2" />
    </div>
    <div>
      <Label htmlFor="interac-message">Message (Optional)</Label>
      <Input id="interac-message" placeholder="Payment message" className="mt-2" />
    </div>
    <div className="bg-muted p-3 rounded-lg">
      <p className="text-xs text-muted-foreground">*Registered trademark of Interac Corp. Used under license.</p>
    </div>
    <Button className="w-full" onClick={onSubmit}>Send via Interac</Button>
  </div>
);

const InternalTransferForm = ({ onSubmit }: { onSubmit: () => void }) => (
  <div className="space-y-4">
    <div>
      <Label htmlFor="internal-email">Recipient Email or Username</Label>
      <Input id="internal-email" placeholder="user@tokenex.com" className="mt-2" />
    </div>
    <div>
      <Label htmlFor="internal-amount">Amount</Label>
      <Input id="internal-amount" type="number" placeholder="0.00" className="mt-2" />
    </div>
    <div>
      <Label htmlFor="internal-note">Note (Optional)</Label>
      <Input id="internal-note" placeholder="What's this for?" className="mt-2" />
    </div>
    <div className="bg-primary/10 p-3 rounded-lg">
      <p className="text-sm font-medium">Instant Transfer • No Fees</p>
    </div>
    <Button className="w-full" onClick={onSubmit}>Send Now</Button>
  </div>
);

export default SendMoneyDialog;
