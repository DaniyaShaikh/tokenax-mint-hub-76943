import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary" />
      
      {/* Animated mesh overlay */}
      <div className="absolute inset-0 opacity-20" style={{ background: 'var(--gradient-mesh)' }} />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-2xl">
            <div className="text-center">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Ready to Transform Real Estate Investment?
              </h2>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join TokenaX today and unlock the future of property ownership through secure digital tokenization.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button 
                  size="lg" 
                  className="group text-lg px-10 py-7 rounded-full bg-white text-foreground hover:bg-white/95 hover:shadow-2xl hover:shadow-white/40 hover:scale-105 transition-all font-bold border-2 border-white"
                  onClick={() => window.location.href = '/auth'}
                >
                  Create Account
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-10 py-7 rounded-full bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 hover:scale-105 transition-all backdrop-blur-sm"
                >
                  Schedule Demo
                </Button>
              </div>
              
              <div className="pt-8 border-t border-white/20">
                <p className="text-sm text-white/80 font-medium">
                  🏆 Trusted by leading financial institutions and property investors worldwide
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
