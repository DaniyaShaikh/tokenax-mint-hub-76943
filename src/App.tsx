import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ListProperty from "./pages/ListProperty";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import KYCReview from "./pages/admin/KYCReview";
import PropertyEvaluation from "./pages/admin/PropertyEvaluation";
import TokenManagement from "./pages/admin/TokenManagement";
import UserManagement from "./pages/admin/UserManagement";
import Analytics from "./pages/admin/Analytics";
import BuyerLayout from "./components/buyer/BuyerLayout";
import BuyerDashboard from "./pages/buyer/BuyerDashboard";
import Transactions from "./pages/buyer/Transactions";
import Accounts from "./pages/buyer/Accounts";
import Marketplace from "./pages/buyer/Marketplace";
import Investments from "./pages/buyer/Investments";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/list-property" element={<ListProperty />} />
          <Route path="/buyer" element={<BuyerLayout />}>
            <Route path="dashboard" element={<BuyerDashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="accounts" element={<Accounts />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="investments" element={<Investments />} />
          </Route>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="kyc" element={<KYCReview />} />
            <Route path="properties" element={<PropertyEvaluation />} />
            <Route path="tokens" element={<TokenManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
