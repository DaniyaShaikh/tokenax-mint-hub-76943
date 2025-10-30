import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, Coins, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: FileText,
    number: "01",
    title: "Submit Property",
    description: "List your real estate asset with complete documentation and undergo our comprehensive verification process.",
  },
  {
    icon: CheckCircle,
    number: "02",
    title: "KYC & Verification",
    description: "Complete identity verification and compliance checks to ensure regulatory standards are met.",
  },
  {
    icon: Coins,
    number: "03",
    title: "Asset Tokenization",
    description: "Your property is converted into digital tokens on the blockchain, creating fractional ownership opportunities.",
  },
  {
    icon: TrendingUp,
    number: "04",
    title: "Trade & Invest",
    description: "Buy, sell, or hold tokens in our secure marketplace with real-time pricing and instant settlement.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-2 bg-secondary/10 rounded-full">
            <span className="text-sm font-semibold text-secondary">Process</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            How <span className="gradient-text">Tokenization</span> Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A simple, secure four-step process to transform real estate into digital assets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting lines for desktop */}
          <div className="hidden lg:block absolute top-1/4 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary -z-10" />
          
          {steps.map((step, index) => (
            <Card 
              key={step.title} 
              className="group relative bg-card hover:bg-gradient-to-br hover:from-card hover:to-primary/5 border-2 hover:border-primary/50 transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl hover:shadow-primary/20"
            >
              <CardHeader className="relative">
                <div className="relative mb-4">
                  {/* Step number background */}
                  <div className="absolute -top-8 -left-6 text-8xl font-bold text-primary/5 select-none">
                    {step.number}
                  </div>
                  
                  {/* Icon container */}
                  <div className="relative inline-flex p-4 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-lg shadow-primary/20 group-hover:shadow-primary/40 group-hover:scale-110 transition-all">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Step number badge */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                    {index + 1}
                  </div>
                </div>
                
                <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                  {step.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
