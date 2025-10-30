import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Coins, Pause, Play, CheckCircle, DollarSign, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface Property {
  id: string;
  title: string;
  address: string;
  valuation: number;
  status: string;
  property_tokens?: Array<{
    id: string;
    total_tokens: number;
    available_tokens: number;
    price_per_token: number;
  }>;
}

interface TokenForm {
  total_tokens: number;
  price_per_token: number;
}

const TokenManagement = () => {
  const [approvedProperties, setApprovedProperties] = useState<Property[]>([]);
  const [tokenizedProperties, setTokenizedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [tokenForms, setTokenForms] = useState<Record<string, TokenForm>>({});
  const [dialogOpen, setDialogOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const [{ data: approved }, { data: tokenized }] = await Promise.all([
        supabase
          .from("properties")
          .select("*")
          .eq("status", "approved")
          .order("created_at", { ascending: false }),
        supabase
          .from("properties")
          .select(`
            *,
            property_tokens (*)
          `)
          .eq("status", "tokenized")
          .order("created_at", { ascending: false }),
      ]);

      if (approved) setApprovedProperties(approved);
      if (tokenized) setTokenizedProperties(tokenized as any);
    } catch (error) {
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTokens = async (propertyId: string) => {
    const form = tokenForms[propertyId];
    if (!form || form.total_tokens <= 0 || form.price_per_token <= 0) {
      toast.error("Please fill in all token details");
      return;
    }

    try {
      // Create tokens
      const { error: tokenError } = await supabase.from("property_tokens").insert({
        property_id: propertyId,
        total_tokens: form.total_tokens,
        available_tokens: form.total_tokens,
        price_per_token: form.price_per_token,
      });

      if (tokenError) throw tokenError;

      // Update property status
      const { error: propertyError } = await supabase
        .from("properties")
        .update({ status: "tokenized" })
        .eq("id", propertyId);

      if (propertyError) throw propertyError;

      toast.success("Tokens created successfully!");
      setDialogOpen({ ...dialogOpen, [propertyId]: false });
      loadProperties();
      setTokenForms((prev) => {
        const updated = { ...prev };
        delete updated[propertyId];
        return updated;
      });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const updateTokenForm = (propertyId: string, field: keyof TokenForm, value: number) => {
    setTokenForms({
      ...tokenForms,
      [propertyId]: {
        ...tokenForms[propertyId],
        [field]: value,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-secondary to-accent p-8 rounded-3xl">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
        <div className="relative">
          <h1 className="text-4xl font-bold text-white mb-2">Token Management</h1>
          <p className="text-white/90 text-lg">
            Create and manage property tokens
          </p>
        </div>
      </div>

      {/* Ready for Tokenization */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold gradient-text">Ready for Tokenization</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {approvedProperties.map((property) => (
            <Card key={property.id} className="border-2 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all hover:-translate-y-1">
              <CardHeader>
                <CardTitle>{property.title}</CardTitle>
                <CardDescription>{property.address}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Valuation</p>
                  <p className="text-2xl font-bold text-accent">
                    ${Number(property.valuation).toLocaleString()}
                  </p>
                </div>

                <Dialog
                  open={dialogOpen[property.id]}
                  onOpenChange={(open) => setDialogOpen({ ...dialogOpen, [property.id]: open })}
                >
                  <DialogTrigger asChild>
                    <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/25 rounded-full">
                      <Coins className="h-4 w-4 mr-2" />
                      Create Tokens
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Property Tokens</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Total Number of Tokens</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 10000"
                          value={tokenForms[property.id]?.total_tokens || ""}
                          onChange={(e) =>
                            updateTokenForm(property.id, "total_tokens", parseInt(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Price Per Token ($)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 100"
                          value={tokenForms[property.id]?.price_per_token || ""}
                          onChange={(e) =>
                            updateTokenForm(property.id, "price_per_token", parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                      {tokenForms[property.id]?.total_tokens &&
                        tokenForms[property.id]?.price_per_token && (
                          <div className="p-4 bg-accent/10 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Total Token Value</p>
                            <p className="text-2xl font-bold text-accent">
                              $
                              {(
                                tokenForms[property.id].total_tokens *
                                tokenForms[property.id].price_per_token
                              ).toLocaleString()}
                            </p>
                          </div>
                        )}
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => handleCreateTokens(property.id)}
                        className="w-full bg-gradient-to-r from-success to-success/80 text-success-foreground hover:shadow-lg hover:shadow-success/25 rounded-full"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Publish & Tokenize
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>

        {approvedProperties.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No properties ready for tokenization
            </CardContent>
          </Card>
        )}
      </div>

      {/* Active Tokenized Properties */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold gradient-text">Active Tokenized Properties</h2>
        <div className="grid grid-cols-1 gap-6">
          {tokenizedProperties.map((property) => {
            const tokens = property.property_tokens[0];
            if (!tokens) return null;

            const soldTokens = tokens.total_tokens - tokens.available_tokens;
            const soldPercentage = (soldTokens / tokens.total_tokens) * 100;

            return (
              <Card key={property.id} className="border-2 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{property.title}</CardTitle>
                      <CardDescription>{property.address}</CardDescription>
                    </div>
                    <div className="px-4 py-2 rounded-full bg-gradient-to-r from-success to-success/80 text-white font-semibold text-sm shadow-lg">
                      Live
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-card rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Coins className="h-4 w-4" />
                        <span>Total Tokens</span>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {tokens.total_tokens.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-card rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <DollarSign className="h-4 w-4" />
                        <span>Price Per Token</span>
                      </div>
                      <p className="text-2xl font-bold text-accent">
                        ${Number(tokens.price_per_token).toFixed(2)}
                      </p>
                    </div>
                    <div className="p-4 bg-card rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>Tokens Sold</span>
                      </div>
                      <p className="text-2xl font-bold text-success">
                        {soldTokens.toLocaleString()}
                        <span className="text-sm text-muted-foreground ml-2">
                          ({soldPercentage.toFixed(1)}%)
                        </span>
                      </p>
                    </div>
                    <div className="p-4 bg-card rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Coins className="h-4 w-4" />
                        <span>Available</span>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {tokens.available_tokens.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {tokenizedProperties.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No tokenized properties yet
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TokenManagement;
