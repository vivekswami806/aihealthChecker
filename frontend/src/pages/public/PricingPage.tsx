import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      desc: "For curiosity and basic health tracking.",
      features: ["2 reports/month", "Standard AI analysis", "Health timeline", "Community support"],
      cta: "Start Free",
      popular: false
    },
    {
      name: "Premium",
      price: "$19",
      period: "/month",
      desc: "Comprehensive analysis for health enthusiasts.",
      features: ["Unlimited reports", "Advanced disease risk assessment", "AI Health Assistant", "Priority processing", "Detailed trend graphs"],
      cta: "Go Premium",
      popular: true
    },
    {
      name: "Family",
      price: "$49",
      period: "/month",
      desc: "The complete package for your whole family.",
      features: ["Up to 5 family members", "All Premium features", "Shared history view", "Doctor consultation portal", "Family wellness benchmarks"],
      cta: "Join Family",
      popular: false
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 space-y-20">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Simple, Transparent <span className="text-primary">Pricing</span></h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Invest in your health with plans that fit every lifestyle. No hidden fees, cancel anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`relative rounded-[2.5rem] p-8 h-full flex flex-col border-2 ${plan.popular ? 'border-primary shadow-2xl shadow-primary/10' : 'border-border shadow-sm'}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1">Most Popular</Badge>
              )}
              <CardHeader className="p-0 mb-8">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-muted-foreground mt-4">{plan.desc}</p>
              </CardHeader>
              <CardContent className="p-0 flex-grow space-y-4 mb-8 text-sm">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span>{f}</span>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="p-0">
                <Button className="w-full h-12 rounded-xl text-lg" variant={plan.popular ? 'default' : 'outline'}>
                  {plan.cta} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
