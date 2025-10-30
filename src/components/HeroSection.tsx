import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, TrendingUp, Sparkles } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/10" />
      
      {/* Animated Mesh Gradient */}
      <div className="absolute inset-0 opacity-30" style={{ background: 'var(--gradient-mesh)' }} />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]" />
      
      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-5 py-2.5 bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-sm rounded-full border border-primary/20 shadow-lg shadow-primary/5">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Institutional-Grade Asset Tokenization Platform
            </span>
          </div>
          
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            <span className="gradient-text">Tokenize Real Estate</span>
            <br />
            <span className="text-foreground">Digitally</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform physical properties into digital tokens with blockchain security. 
            Enable fractional ownership, instant trading, and complete transparency.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Button size="lg" className="group text-lg px-10 py-7 rounded-full bg-gradient-to-r from-primary to-secondary hover:shadow-2xl hover:shadow-primary/30 hover:scale-105 transition-all">
              Start Tokenizing
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-10 py-7 rounded-full hover:bg-muted hover:scale-105 transition-all border-2"
            >
              View Marketplace
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="group relative bg-card rounded-3xl p-8 border border-border shadow-lg hover:shadow-xl hover:shadow-primary/10 transition-all hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-xl">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-5xl font-bold gradient-text">$2.5B+</div>
                </div>
                <div className="text-muted-foreground font-medium">Assets Tokenized</div>
              </div>
            </div>
            <div className="group relative bg-card rounded-3xl p-8 border border-border shadow-lg hover:shadow-xl hover:shadow-secondary/10 transition-all hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-br from-secondary to-primary rounded-xl">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-5xl font-bold gradient-text">100%</div>
                </div>
                <div className="text-muted-foreground font-medium">Secure & Compliant</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
