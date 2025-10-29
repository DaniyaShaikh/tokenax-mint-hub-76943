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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <a href={isAuthenticated ? "/dashboard" : "/"}>
              <img src={tokenaxLogo} alt="TokenaX" className="h-10 w-auto" />
            </a>
          </div>
          
          {!isAuthenticated && (
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
                How It Works
              </a>
              <a href="#marketplace" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
                Marketplace
              </a>
            </div>
          )}
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => window.location.href = '/auth'}>
                  Sign In
                </Button>
                <Button variant="hero" size="sm" onClick={() => window.location.href = '/auth'}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
