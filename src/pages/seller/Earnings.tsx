import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DollarSign, TrendingUp, Coins, Building2, Calendar } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Transaction {
  id: string;
  property_id: string;
  total_amount: number;
  tokens_purchased: number;
  purchased_at: string;
  property_title?: string;
}

interface PropertyEarnings {
  property_id: string;
  property_title: string;
  total_earnings: number;
  total_tokens_sold: number;
  transaction_count: number;
}

const Earnings = () => {
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [propertyEarnings, setPropertyEarnings] = useState<PropertyEarnings[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    fetchEarningsData();
  }, []);

  const fetchEarningsData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user's properties
      const { data: properties, error: propsError } = await supabase
        .from("properties")
        .select("id, title")
        .eq("owner_id", user.id);

      if (propsError) throw propsError;

      const propertyIds = properties?.map(p => p.id) || [];

      if (propertyIds.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch all transactions for user's properties
      const { data: purchasesData, error: purchasesError } = await supabase
        .from("token_purchases")
        .select("*")
        .in("property_id", propertyIds)
        .order("purchased_at", { ascending: false });

      if (purchasesError) throw purchasesError;

      // Add property titles to transactions
      const transactionsWithTitles = purchasesData?.map(purchase => ({
        ...purchase,
        property_title: properties?.find(p => p.id === purchase.property_id)?.title || "Unknown Property",
      })) || [];

      setTransactions(transactionsWithTitles);

      // Calculate total earnings
      const total = purchasesData?.reduce((sum, p) => sum + Number(p.total_amount), 0) || 0;
      setTotalEarnings(total);

      // Calculate earnings by property
      const earningsByProperty: Record<string, PropertyEarnings> = {};
      
      purchasesData?.forEach(purchase => {
        const propertyId = purchase.property_id;
        if (!earningsByProperty[propertyId]) {
          earningsByProperty[propertyId] = {
            property_id: propertyId,
            property_title: properties?.find(p => p.id === propertyId)?.title || "Unknown",
            total_earnings: 0,
            total_tokens_sold: 0,
            transaction_count: 0,
          };
        }
        earningsByProperty[propertyId].total_earnings += Number(purchase.total_amount);
        earningsByProperty[propertyId].total_tokens_sold += Number(purchase.tokens_purchased);
        earningsByProperty[propertyId].transaction_count += 1;
      });

      setPropertyEarnings(Object.values(earningsByProperty));

      // Generate monthly earnings data (last 6 months)
      const monthlyEarnings = new Map<string, number>();
      purchasesData?.forEach(purchase => {
        const date = new Date(purchase.purchased_at);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyEarnings.set(monthKey, (monthlyEarnings.get(monthKey) || 0) + Number(purchase.total_amount));
      });

      const chartData = Array.from(monthlyEarnings.entries())
        .map(([month, amount]) => ({ month, earnings: amount }))
        .slice(-6);

      setMonthlyData(chartData);
      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching earnings:", error);
      toast.error("Failed to load earnings data");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Earnings</h2>
        <p className="text-muted-foreground">Track your revenue and payouts</p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading earnings data...</p>
          </CardContent>
        </Card>
      ) : transactions.length === 0 ? (
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No earnings yet</h3>
            <p className="text-muted-foreground">
              Once your tokenized properties start selling, your earnings will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-normal text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${totalEarnings.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">From all properties</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-normal text-muted-foreground flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  Tokens Sold
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {transactions.reduce((sum, t) => sum + Number(t.tokens_purchased), 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total tokens</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-normal text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{transactions.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Total sales</p>
              </CardContent>
            </Card>
          </div>

          {/* Earnings Chart */}
          {monthlyData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Monthly Earnings</CardTitle>
                <CardDescription>Your earnings over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                    <Line type="monotone" dataKey="earnings" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Earnings by Property */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Earnings by Property
              </CardTitle>
              <CardDescription>Revenue breakdown for each property</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={propertyEarnings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="property_title" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  <Bar dataKey="total_earnings" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Property Earnings Table */}
          <Card>
            <CardHeader>
              <CardTitle>Property Performance</CardTitle>
              <CardDescription>Detailed earnings for each property</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead className="text-right">Total Earnings</TableHead>
                    <TableHead className="text-right">Tokens Sold</TableHead>
                    <TableHead className="text-right">Transactions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {propertyEarnings.map((property) => (
                    <TableRow key={property.property_id}>
                      <TableCell className="font-medium">{property.property_title}</TableCell>
                      <TableCell className="text-right">
                        ${property.total_earnings.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {property.total_tokens_sold.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{property.transaction_count}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Transactions
              </CardTitle>
              <CardDescription>Latest token sales from your properties</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead className="text-right">Tokens</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 10).map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.property_title}</TableCell>
                      <TableCell className="text-right">
                        {Number(transaction.tokens_purchased).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        ${Number(transaction.total_amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Date(transaction.purchased_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Earnings;
