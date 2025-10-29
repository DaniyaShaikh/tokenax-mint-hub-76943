import { Card } from "@/components/ui/card";
import { Shield, Users, Zap, Globe, Lock, BarChart } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "KYC/KYB Verified",
    description: "Institutional-grade identity verification for buyers and sellers ensuring complete compliance."
  },
  {
    icon: Zap,
    title: "Instant Tokenization",
    description: "Transform property ownership into digital tokens in minutes, not months."
  },
  {
    icon: Users,
    title: "Fractional Ownership",
    description: "Enable multiple investors to own portions of high-value properties through tokens."
  },
  {
    icon: Globe,
    title: "Global Marketplace",
    description: "Access worldwide property investments and reach international buyers instantly."
  },
  {
    icon: Lock,
    title: "Secure & Transparent",
    description: "Distributed ledger technology ensures immutable records and complete transaction transparency."
  },
  {
    icon: BarChart,
    title: "Real-Time Analytics",
    description: "Track token performance, ownership distribution, and investment returns in real-time."
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Why Choose TokenaX?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Enterprise-grade infrastructure for seamless asset tokenization
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-8 hover:shadow-[0_0_30px_hsl(195,100%,50%/0.15)] transition-all duration-300 border-border bg-card"
            >
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <feature.icon className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
