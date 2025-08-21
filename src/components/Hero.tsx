import QuoteWizard from '@/components/quote/QuoteWizard';
import { ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import Image from 'next/image';

const Hero = () => {
  return (
    <section
      className="relative w-full pt-40 pb-16 md:pt-48 md:pb-24 lg:pt-56 lg:pb-32"
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('https://placehold.co/1920x1080.png')" }}
        data-ai-hint="insurance office"
      ></div>
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      <div className="container mx-auto px-4 relative z-20">
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
                <ShieldCheck className="h-6 w-6 text-white" />
                <span>We compare 50+ NZ insurers</span>
              </li>
               <li className="flex items-center text-lg gap-3">
                <ShieldCheck className="h-6 w-6 text-white" />
                <span>Get independent advice</span>
              </li>
               <li className="flex items-center text-lg gap-3">
                <ShieldCheck className="h-6 w-6 text-white" />
                <span>Trusted by thousands of Kiwis</span>
              </li>
            </ul>
             <Button size="lg" className="mt-8 bg-primary hover:bg-primary/90">Get Your Quote</Button>
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
