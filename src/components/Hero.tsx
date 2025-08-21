import QuoteWizard from '@/components/quote/QuoteWizard';
import { CheckCircle } from 'lucide-react';

const Hero = () => {
    const features = [
        'Fast & Easy Online Quotes',
        'Compare NZ’s Top Insurers',
        'No Obligation To Buy',
        'Find The Best Deals',
    ];

    return (
        <section className="relative w-full overflow-hidden">
            <div className="container mx-auto px-4 py-12 lg:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="text-white">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold !leading-tight mb-6">
                            COMPARE NZ'S BEST INSURANCE DEALS IN 60 SECONDS
                        </h1>
                        <ul className="space-y-3">
                            {features.map((feature, index) => (
                                <li key={index} className="flex items-center text-lg">
                                    <CheckCircle className="h-6 w-6 text-accent mr-3" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
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
