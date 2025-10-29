import { Card } from "@/components/ui/card";
import { UserCheck, Building, Coins, ShoppingCart } from "lucide-react";

const steps = [
  {
    icon: UserCheck,
    number: "01",
    title: "Complete KYC/KYB",
    description: "Verify your identity or business credentials through our secure verification process."
  },
  {
    icon: Building,
    number: "02",
    title: "List Your Property",
    description: "Submit property details, ownership documents, and valuation for admin evaluation."
  },
  {
    icon: Coins,
    number: "03",
    title: "Tokenization",
    description: "Once approved, your property is divided into digital tokens representing ownership shares."
  },
  {
    icon: ShoppingCart,
    number: "04",
    title: "Trade & Invest",
    description: "Tokens go live on the marketplace where buyers can purchase fractional ownership."
  }
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Four simple steps to tokenize and trade real estate assets
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card 
              key={index}
              className="relative p-8 bg-card border-border hover:shadow-[0_0_30px_hsl(195,100%,50%/0.15)] transition-all duration-300"
            >
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-accent/10 border-4 border-background flex items-center justify-center">
                <span className="text-2xl font-bold text-accent">{step.number}</span>
              </div>
              
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <step.icon className="w-7 h-7 text-accent" />
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
