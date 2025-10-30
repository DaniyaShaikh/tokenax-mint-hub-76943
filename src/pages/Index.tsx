import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import CTASection from "@/components/CTASection";
import { Layers } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="p-2 bg-gradient-to-r from-primary to-secondary rounded-lg">
                <Layers className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 TokenaX. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/70 mt-2">
              Institutional-Grade Asset Tokenization Platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
