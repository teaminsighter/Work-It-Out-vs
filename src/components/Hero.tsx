import QuoteWizard from '@/components/quote/QuoteWizard';
import { CheckCircle } from 'lucide-react';
import { Button } from './ui/button';

const Hero = () => {
  return (
    <section
      className="relative w-full py-16 md:py-24 lg:py-32 teal-gradient"
    >
      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold !leading-tight mb-4 text-shadow-lg">
              COMPARE NZ'S BEST INSURANCE DEALS IN 60 SECONDS
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8">
              Get quick comparisons from leading NZ insurers and receive expert advice to find the perfect cover for you.
            </p>
            <ul className="space-y-3">
               <li className="flex items-center text-lg gap-3">
                <CheckCircle className="h-6 w-6 text-white" />
                <span>We compare 50+ NZ insurers</span>
              </li>
               <li className="flex items-center text-lg gap-3">
                <CheckCircle className="h-6 w-6 text-white" />
                <span>Get independent advice</span>
              </li>
               <li className="flex items-center text-lg gap-3">
                <CheckCircle className="h-6 w-6 text-white" />
                <span>Trusted by thousands of Kiwis</span>
              </li>
            </ul>
             <Button size="lg" className="mt-8">Get Your Quote</Button>
          </div>
          <div>
            <QuoteWizard />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
