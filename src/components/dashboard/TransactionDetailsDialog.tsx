import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  type: string;
  category: string;
  description: string;
  amount: number;
  status: string;
  property?: string;
  tokens?: number;
  pricePerToken?: number;
  transactionId: string;
  paymentMethod?: string;
  recipient?: string;
}

interface TransactionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
}

const TransactionDetailsDialog = ({ open, onOpenChange, transaction }: TransactionDetailsDialogProps) => {
  if (!transaction) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "failed":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-muted";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Transaction Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Amount */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Amount</p>
              <p className={`text-3xl font-bold ${transaction.amount > 0 ? "text-green-600" : "text-foreground"}`}>
                {transaction.amount > 0 ? "+" : ""}
                {transaction.amount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </p>
            </div>
            <Badge variant="outline" className={getStatusColor(transaction.status)}>
              {transaction.status}
            </Badge>
          </div>

          <Separator />

          {/* Transaction Information */}
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Transaction ID</p>
                <p className="font-medium text-sm font-mono">{transaction.transactionId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date & Time</p>
                <p className="font-medium text-sm">{transaction.date}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Type</p>
                <Badge variant="secondary">{transaction.type}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Category</p>
                <p className="font-medium text-sm">{transaction.category}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Description</p>
              <p className="font-medium">{transaction.description}</p>
            </div>

            {transaction.property && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Property</p>
                <p className="font-medium">{transaction.property}</p>
              </div>
            )}

            {transaction.tokens && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tokens</p>
                  <p className="font-medium">{transaction.tokens.toLocaleString()}</p>
                </div>
                {transaction.pricePerToken && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Price per Token</p>
                    <p className="font-medium">
                      {transaction.pricePerToken.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                    </p>
                  </div>
                )}
              </div>
            )}

            {transaction.paymentMethod && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                <p className="font-medium">{transaction.paymentMethod}</p>
              </div>
            )}

            {transaction.recipient && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Recipient</p>
                <p className="font-medium">{transaction.recipient}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex justify-between items-center">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Download Receipt
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View on Blockchain
            </Button>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-xs text-muted-foreground">
              If you have any questions about this transaction, please contact our support team with the transaction ID.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailsDialog;
