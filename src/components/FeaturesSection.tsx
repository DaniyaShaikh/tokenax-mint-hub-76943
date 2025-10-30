import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Zap, Users, TrendingUp, Lock, Globe } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description: "Military-grade encryption and multi-signature wallet protection ensure your assets are always secure.",
  },
  {
    icon: Zap,
    title: "Instant Settlement",
    description: "Execute trades in seconds with blockchain technology. No more waiting for paperwork or intermediaries.",
  },
  {
    icon: Users,
    title: "Fractional Ownership",
    description: "Democratize real estate investment by enabling ownership of property fractions starting from $100.",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Analytics",
    description: "Monitor portfolio performance, market trends, and investment metrics with advanced analytics tools.",
  },
  {
    icon: Lock,
    title: "Regulatory Compliant",
    description: "Fully compliant with SEC regulations and international financial standards for peace of mind.",
  },
  {
    icon: Globe,
    title: "Global Marketplace",
    description: "Access worldwide real estate opportunities and connect with international investors seamlessly.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-2 bg-primary/10 rounded-full">
            <span className="text-sm font-semibold text-primary">Features</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="gradient-text">Powerful Features</span> for Modern Investors
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to tokenize, trade, and manage real estate assets in the digital age.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card 
              key={feature.title} 
              className="group relative bg-card hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/5 to-secondary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <CardHeader className="relative">
                <div className="mb-4 inline-flex p-4 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow group-hover:scale-110 transform duration-300">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative">
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
