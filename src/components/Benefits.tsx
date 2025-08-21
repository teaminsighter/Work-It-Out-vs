import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, User, Landmark, Star, CircleDollarSign, Gift } from 'lucide-react';

const benefits = [
  {
    icon: CheckCircle,
    title: 'Get Best Prices',
    description: 'We scan the market to find you the most competitive insurance rates available.',
  },
  {
    icon: User,
    title: 'Expert NZ Advice',
    description: 'Our team of local experts provides unbiased advice tailored to your needs.',
  },
  {
    icon: Landmark,
    title: 'We Are Independent',
    description: 'Our recommendations are impartial, focused solely on what\'s best for you.',
  },
  {
    icon: Star,
    title: 'Professional Service',
    description: 'Experience a seamless and professional process from start to finish.',
  },
  {
    icon: CircleDollarSign,
    title: 'Save Big Bucks',
    description: 'Our clients save hundreds on average by comparing deals with us.',
  },
  {
    icon: Gift,
    title: '100% Free Comparison',
    description: 'Our quote and comparison service is completely free with no obligations.',
  },
];

const Benefits = () => {
  return (
    <section className="bg-gray-50 py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30 text-sm">BEST INSURANCE PRICE GUARANTEE</Badge>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Why Choose Us
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
              <CardHeader className="items-center">
                <div className="bg-primary/10 p-3 rounded-full">
                  <benefit.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="pt-2">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
