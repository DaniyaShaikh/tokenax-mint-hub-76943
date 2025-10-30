import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Download, Eye, ArrowUpRight, ArrowDownRight } from "lucide-react";
import TransactionDetailsDialog from "@/components/dashboard/TransactionDetailsDialog";

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

const Transactions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Sample transaction data
  const allTransactions: Transaction[] = [
    {
      id: "1",
      date: "2025-01-28 14:32:15",
      type: "Investment",
      category: "Token Purchase",
      description: "Token Purchase - Luxury Downtown Condo",
      amount: -15000,
      status: "Completed",
      property: "Luxury Downtown Condo, Unit 2401",
      tokens: 150,
      pricePerToken: 100,
      transactionId: "TXN-2025-001-4F8A9C",
      paymentMethod: "Bank Transfer (ACH)",
    },
    {
      id: "2",
      date: "2025-01-27 09:15:42",
      type: "Income",
      category: "Rental Distribution",
      description: "Monthly Rental Income Distribution",
      amount: 847.50,
      status: "Completed",
      property: "Suburban Family Home, 123 Oak Street",
      tokens: 85,
      transactionId: "TXN-2025-002-7B3E2D",
    },
    {
      id: "3",
      date: "2025-01-25 16:48:30",
      type: "Withdrawal",
      category: "Token Sale",
      description: "Token Sale - Commercial Property Downtown",
      amount: 23200,
      status: "Completed",
      property: "Commercial Property, 456 Business Ave",
      tokens: 200,
      pricePerToken: 116,
      transactionId: "TXN-2025-003-9A1C5F",
    },
    {
      id: "4",
      date: "2025-01-23 11:20:05",
      type: "Investment",
      category: "Token Purchase",
      description: "Token Purchase - Suburban Family Home",
      amount: -8500,
      status: "Completed",
      property: "Suburban Family Home, 123 Oak Street",
      tokens: 85,
      pricePerToken: 100,
      transactionId: "TXN-2025-004-2E6B8H",
      paymentMethod: "Credit Card",
    },
    {
      id: "5",
      date: "2025-01-22 08:05:20",
      type: "Income",
      category: "Appreciation",
      description: "Property Appreciation Payout",
      amount: 1240,
      status: "Completed",
      property: "Luxury Downtown Condo, Unit 2401",
      transactionId: "TXN-2025-005-3G9D1K",
    },
    {
      id: "6",
      date: "2025-01-20 13:45:18",
      type: "Transfer",
      category: "Deposit",
      description: "Account Funding via Wire Transfer",
      amount: 50000,
      status: "Completed",
      transactionId: "TXN-2025-006-8J4F7M",
      paymentMethod: "Wire Transfer (SWIFT)",
    },
    {
      id: "7",
      date: "2025-01-18 10:30:45",
      type: "Investment",
      category: "Token Purchase",
      description: "Token Purchase - Mountain View Retreat",
      amount: -12500,
      status: "Pending",
      property: "Mountain View Retreat, Luxury Lodge",
      tokens: 125,
      pricePerToken: 100,
      transactionId: "TXN-2025-007-5K2L9P",
      paymentMethod: "Bank Transfer (EFT)",
    },
    {
      id: "8",
      date: "2025-01-15 15:22:33",
      type: "Income",
      category: "Dividend",
      description: "Quarterly Dividend Payment",
      amount: 2150,
      status: "Completed",
      transactionId: "TXN-2025-008-6N8Q3R",
    },
    {
      id: "9",
      date: "2025-01-12 09:10:55",
      type: "Transfer",
      category: "Withdrawal",
      description: "Bank Account Withdrawal",
      amount: -5000,
      status: "Completed",
      recipient: "Personal Bank Account ****1234",
      transactionId: "TXN-2025-009-7P4S8T",
      paymentMethod: "ACH Transfer",
    },
    {
      id: "10",
      date: "2025-01-10 14:55:12",
      type: "Investment",
      category: "Token Purchase",
      description: "Token Purchase - Beachfront Villa",
      amount: -28900,
      status: "Failed",
      property: "Beachfront Villa, Paradise Coast",
      tokens: 289,
      pricePerToken: 100,
      transactionId: "TXN-2025-010-9R7U2V",
      paymentMethod: "Credit Card",
    },
  ];

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((transaction) => {
      const matchesSearch =
        searchQuery === "" ||
        transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.property?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === "all" || transaction.type === typeFilter;
      const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [allTransactions, searchQuery, typeFilter, statusFilter]);

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailsOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-500/10 text-green-600";
      case "pending":
        return "bg-yellow-500/10 text-yellow-600";
      case "failed":
        return "bg-red-500/10 text-red-600";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground">View and manage your transaction history</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by description, transaction ID, or property..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Type Filter */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Investment">Investment</SelectItem>
              <SelectItem value="Income">Income</SelectItem>
              <SelectItem value="Withdrawal">Withdrawal</SelectItem>
              <SelectItem value="Transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredTransactions.length} of {allTransactions.length} transactions
        </div>
      </Card>

      {/* Transactions Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium text-sm whitespace-nowrap">
                    {transaction.date}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start gap-2">
                      <div className={`p-1.5 rounded-lg mt-0.5 ${transaction.amount > 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
                        {transaction.amount > 0 ? (
                          <ArrowDownRight className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <ArrowUpRight className="h-3.5 w-3.5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">{transaction.transactionId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{transaction.type}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{transaction.category}</TableCell>
                  <TableCell className={`text-right font-semibold ${transaction.amount > 0 ? "text-green-600" : ""}`}>
                    {transaction.amount > 0 ? "+" : ""}
                    {transaction.amount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(transaction)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No transactions found matching your filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Transaction Details Dialog */}
      <TransactionDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        transaction={selectedTransaction}
      />
    </div>
  );
};

export default Transactions;
