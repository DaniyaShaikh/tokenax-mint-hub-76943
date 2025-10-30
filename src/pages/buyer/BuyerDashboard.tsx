import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  PlusCircle, 
  Send, 
  RefreshCcw, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight 
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import AddMoneyDialog from "@/components/dashboard/AddMoneyDialog";
import SendMoneyDialog from "@/components/dashboard/SendMoneyDialog";
import ConvertFundsDialog from "@/components/dashboard/ConvertFundsDialog";

const BuyerDashboard = () => {
  const [userName, setUserName] = useState("");
  const [addMoneyOpen, setAddMoneyOpen] = useState(false);
  const [sendMoneyOpen, setSendMoneyOpen] = useState(false);
  const [convertFundsOpen, setConvertFundsOpen] = useState(false);

  useEffect(() => {
    fetchUserName();
  }, []);

  const fetchUserName = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        
        if (profile?.full_name) {
          setUserName(profile.full_name.split(" ")[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching user name:", error);
    }
  };

  // Sample data for the performance graph
  const performanceData = [
    { month: "May", value: 42500 },
    { month: "Jun", value: 51200 },
    { month: "Jul", value: 48900 },
    { month: "Aug", value: 62300 },
    { month: "Sep", value: 58700 },
    { month: "Oct", value: 71400 },
  ];

  // Sample transaction data
  const recentTransactions = [
    { id: 1, name: "Token Purchase - Luxury Condo Downtown", type: "Investment", amount: -15000, date: "2 hours ago" },
    { id: 2, name: "Rental Income Distribution", type: "Income", amount: 847, date: "1 day ago" },
    { id: 3, name: "Token Sale - Commercial Property", type: "Withdrawal", amount: 23200, date: "3 days ago" },
    { id: 4, name: "Token Purchase - Suburban Home", type: "Investment", amount: -8500, date: "5 days ago" },
    { id: 5, name: "Property Appreciation Payout", type: "Income", amount: 1240, date: "1 week ago" },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-4xl font-bold">Hello, {userName || "Investor"}!</h1>
      </div>

      {/* Wallet Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button size="lg" className="gap-2 bg-foreground text-background hover:bg-foreground/90" onClick={() => setAddMoneyOpen(true)}>
          <PlusCircle className="h-5 w-5" />
          Add money
        </Button>
        <Button size="lg" variant="outline" className="gap-2" onClick={() => setSendMoneyOpen(true)}>
          <Send className="h-5 w-5" />
          Send money
        </Button>
        <Button size="lg" variant="outline" className="gap-2" onClick={() => setConvertFundsOpen(true)}>
          <RefreshCcw className="h-5 w-5" />
          Convert funds
        </Button>
      </div>

      {/* Currency Accounts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              🇨🇦 CAD Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">$12,547.89</div>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              2% Interest
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              🇺🇸 USD Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">$8,234.50</div>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              2% Interest
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Investment Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$71,400</div>
            <p className="text-xs text-muted-foreground mt-1">+14.8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground mt-1">Across all assets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$83,920</div>
            <p className="text-xs text-muted-foreground mt-1">Current valuation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">17.6%</div>
            <p className="text-xs text-muted-foreground mt-1">Return on investment</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions and Performance Graph */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest activity</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              View all
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${transaction.amount > 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                      {transaction.amount > 0 ? (
                        <ArrowDownRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{transaction.name}</p>
                      <p className="text-xs text-muted-foreground">{transaction.type} • {transaction.date}</p>
                    </div>
                  </div>
                  <div className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Asset Performance Graph */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Performance</CardTitle>
            <CardDescription>Portfolio value over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs"
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  className="text-xs"
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  name="Portfolio Value"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <AddMoneyDialog open={addMoneyOpen} onOpenChange={setAddMoneyOpen} />
      <SendMoneyDialog open={sendMoneyOpen} onOpenChange={setSendMoneyOpen} />
      <ConvertFundsDialog open={convertFundsOpen} onOpenChange={setConvertFundsOpen} />
    </div>
  );
};

export default BuyerDashboard;
