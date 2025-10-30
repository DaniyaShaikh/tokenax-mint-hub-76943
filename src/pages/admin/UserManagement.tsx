import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Mail, Calendar, Shield, CheckCircle, XCircle, Search } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  user_mode: string;
  created_at: string;
  kyc_verifications: Array<{
    status: string;
    verification_type: string;
  }>;
  user_roles: Array<{
    role: string;
  }>;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select(`
          *,
          kyc_verifications (status, verification_type),
          user_roles (role)
        `)
        .order("created_at", { ascending: false });

      if (data) {
        setUsers(data as any);
      }
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getKYCStatus = (user: UserProfile) => {
    if (!user.kyc_verifications || user.kyc_verifications.length === 0) {
      return { status: "not_submitted", label: "Not Submitted", variant: "secondary" as const };
    }

    const latestKYC = user.kyc_verifications[0];
    if (latestKYC.status === "approved") {
      return { status: "approved", label: "Verified", variant: "default" as const };
    }
    if (latestKYC.status === "pending") {
      return { status: "pending", label: "Pending", variant: "secondary" as const };
    }
    return { status: "rejected", label: "Rejected", variant: "destructive" as const };
  };

  const isAdmin = (user: UserProfile) => {
    return user.user_roles?.some((r) => r.role === "admin");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
      </div>
    );
  }

  const stats = {
    total: users.length,
    verified: users.filter((u) => getKYCStatus(u).status === "approved").length,
    pending: users.filter((u) => getKYCStatus(u).status === "pending").length,
    admins: users.filter(isAdmin).length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-secondary to-accent p-8 rounded-3xl">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
        <div className="relative">
          <h1 className="text-4xl font-bold text-white mb-2">User Management</h1>
          <p className="text-white/90 text-lg">Manage platform users and permissions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 hover:border-primary/30 hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
            <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-xl">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold gradient-text">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Verified Users
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{stats.verified}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending KYC
            </CardTitle>
            <XCircle className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Admin Users
            </CardTitle>
            <Shield className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{stats.admins}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>KYC Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const kycStatus = getKYCStatus(user);
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name || "Unknown"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {user.user_mode}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={kycStatus.variant}>{kycStatus.label}</Badge>
                    </TableCell>
                    <TableCell>
                      {isAdmin(user) ? (
                        <Badge className="bg-accent text-accent-foreground">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="secondary">User</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              No users found matching your search
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
