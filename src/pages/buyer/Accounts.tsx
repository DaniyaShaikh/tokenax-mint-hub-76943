import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  PlusCircle, 
  RefreshCcw, 
  Send, 
  Download, 
  Eye, 
  Copy,
  ArrowRightLeft,
  TrendingUp,
  Clock
} from "lucide-react";
import AddMoneyDialog from "@/components/dashboard/AddMoneyDialog";
import SendMoneyDialog from "@/components/dashboard/SendMoneyDialog";
import ConvertFundsDialog from "@/components/dashboard/ConvertFundsDialog";
import { toast } from "@/hooks/use-toast";

interface Account {
  id: string;
  currency: string;
  symbol: string;
  flag: string;
  balance: number;
  interest: number;
  accountNumber: string;
  recentActivity: {
    date: string;
    description: string;
    amount: number;
  }[];
}

const Accounts = () => {
  const [addMoneyOpen, setAddMoneyOpen] = useState(false);
  const [sendMoneyOpen, setSendMoneyOpen] = useState(false);
  const [convertFundsOpen, setConvertFundsOpen] = useState(false);

  // Sample account data
  const accounts: Account[] = [
    {
      id: "1",
      currency: "CAD",
      symbol: "$",
      flag: "🇨🇦",
      balance: 12547.89,
      interest: 2.0,
      accountNumber: "****5678",
      recentActivity: [
        { date: "2025-01-28", description: "Property Investment", amount: -8500 },
        { date: "2025-01-25", description: "Rental Income", amount: 847.50 },
        { date: "2025-01-22", description: "Deposit via EFT", amount: 5000 },
      ]
    },
    {
      id: "2",
      currency: "USD",
      symbol: "$",
      flag: "🇺🇸",
      balance: 8234.50,
      interest: 2.0,
      accountNumber: "****1234",
      recentActivity: [
        { date: "2025-01-27", description: "Token Purchase", amount: -15000 },
        { date: "2025-01-23", description: "Dividend Payment", amount: 1240 },
        { date: "2025-01-20", description: "Wire Transfer", amount: 20000 },
      ]
    }
  ];

  const totalBalance = accounts.reduce((sum, acc) => {
    // Simple conversion assuming 1 USD = 1.35 CAD for display
    const inCAD = acc.currency === "USD" ? acc.balance * 1.35 : acc.balance;
    return sum + inCAD;
  }, 0);

  const copyAccountNumber = (accountNumber: string) => {
    navigator.clipboard.writeText(accountNumber);
    toast({ description: "Account number copied to clipboard" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Accounts</h2>
          <p className="text-muted-foreground">Manage your currency accounts and balances</p>
        </div>
      </div>

      {/* Total Balance Overview */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
              <p className="text-4xl font-bold">
                {totalBalance.toLocaleString("en-CA", { style: "currency", currency: "CAD" })}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Converted to CAD</p>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-5 w-5" />
              <span className="text-lg font-semibold">+5.2%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button size="lg" className="gap-2" onClick={() => setAddMoneyOpen(true)}>
          <PlusCircle className="h-5 w-5" />
          Add Money
        </Button>
        <Button size="lg" variant="outline" className="gap-2" onClick={() => setConvertFundsOpen(true)}>
          <RefreshCcw className="h-5 w-5" />
          Convert Funds
        </Button>
        <Button size="lg" variant="outline" className="gap-2" onClick={() => setSendMoneyOpen(true)}>
          <Send className="h-5 w-5" />
          Send Money
        </Button>
      </div>

      {/* Main Accounts Section */}
      <div>
        <div className="mb-4">
          <h3 className="text-xl font-semibold">Main Accounts</h3>
          <p className="text-sm text-muted-foreground">
            Instantly convert between your accounts at the best FX rates
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {accounts.map((account) => (
            <Card key={account.id} className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-2xl">{account.flag}</span>
                    {account.currency} Account
                  </CardTitle>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {account.interest}% Interest
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Balance */}
                <div>
                  <p className="text-4xl font-bold">
                    {account.currency === "USD" ? "US" : ""}
                    {account.symbol}
                    {account.balance.toLocaleString("en-US", { 
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2 
                    })}
                  </p>
                </div>

                {/* Account Number */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Account Number: {account.accountNumber}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyAccountNumber(account.accountNumber)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>

                <Separator />

                {/* Recent Activity */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Recent Activity</p>
                  </div>
                  <div className="space-y-2">
                    {account.recentActivity.map((activity, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{activity.date}</p>
                        </div>
                        <span className={`font-semibold ${activity.amount > 0 ? "text-green-600" : ""}`}>
                          {activity.amount > 0 ? "+" : ""}
                          {account.symbol}
                          {Math.abs(activity.amount).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Account Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <Download className="h-4 w-4" />
                    Statement
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Sub-Accounts Section */}
      <div>
        <div className="mb-4">
          <h3 className="text-xl font-semibold">Sub-Accounts</h3>
          <p className="text-sm text-muted-foreground">
            Keep separate balances, not included in your main account balance
          </p>
        </div>

        <Card className="border-dashed hover:border-primary transition-colors cursor-pointer">
          <CardContent className="flex items-center justify-center py-8">
            <Button variant="ghost" className="gap-2">
              <PlusCircle className="h-5 w-5" />
              Create a Sub-Account
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Account Information */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h4 className="font-semibold mb-1">Easy Transfers</h4>
              <p className="text-sm text-muted-foreground">
                Move money between your accounts instantly with no fees
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Competitive Interest</h4>
              <p className="text-sm text-muted-foreground">
                Earn 2% interest on all account balances automatically
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Secure & Insured</h4>
              <p className="text-sm text-muted-foreground">
                Your accounts are protected and fully insured up to $250,000
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddMoneyDialog open={addMoneyOpen} onOpenChange={setAddMoneyOpen} />
      <SendMoneyDialog open={sendMoneyOpen} onOpenChange={setSendMoneyOpen} />
      <ConvertFundsDialog open={convertFundsOpen} onOpenChange={setConvertFundsOpen} />
    </div>
  );
};

export default Accounts;
