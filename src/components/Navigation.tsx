import { Button } from "@/components/ui/button";
import tokenaxLogo from "@/assets/tokenax-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";

const Navigation = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border/50 shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <a 
            href={isAuthenticated ? "/dashboard" : "/"} 
            className="flex items-center space-x-3 group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-lg blur-sm opacity-50 group-hover:opacity-75 transition-opacity" />
              <img 
                src={tokenaxLogo} 
                alt="TokenaX" 
                className="h-10 w-auto relative z-10"
              />
            </div>
          </a>

          {!isAuthenticated && (
            <div className="hidden md:flex items-center space-x-1">
              <a href="#features" className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-muted/50 rounded-lg transition-all">
                Features
              </a>
              <a href="#how-it-works" className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-muted/50 rounded-lg transition-all">
                How It Works
              </a>
              <a href="#marketplace" className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-muted/50 rounded-lg transition-all">
                Marketplace
              </a>
            </div>
          )}

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <Button onClick={handleSignOut} variant="outline" className="rounded-full">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <>
                <Button variant="ghost" className="rounded-full" onClick={() => window.location.href = '/auth'}>
                  Sign In
                </Button>
                <Button className="rounded-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/25 transition-all" onClick={() => window.location.href = '/auth'}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navigation;
