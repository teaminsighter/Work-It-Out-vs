
'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useForm } from '@/contexts/FormContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Check, Users, FileText, ThumbsUp, Star } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Insurers from '@/components/Insurers';

const QuoteWizardLife = dynamic(() => import('@/components/quote/QuoteWizardLife'), {
  loading: () => <div className="w-full max-w-2xl mx-auto p-6 sm:p-10 mt-6"><Skeleton className="h-[400px] w-full" /></div>,
  ssr: false,
});

const LifePageHero = () => {
  const { quoteWizardRef } = useForm();
  return (
    <section className="relative w-full pt-40 pb-16 md:pt-48 md:pb-24 lg:pt-56 lg:pb-32">
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('https://firebasestorage.googleapis.com/v0/b/quoteflow-insurance.firebasestorage.app/o/Lanind%20Page%201%2Ffamily.jpeg?alt=media&token=424b8995-e4f0-4cf9-b257-623ca0287635')" }}
        data-ai-hint="happy family"
      ></div>
      <div className="absolute inset-0 animated-gradient"></div>
      <div className="container mx-auto px-4 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold !leading-tight mb-4 text-shadow-lg">
              Compare Life Insurance Quotes
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-xl">
              See fair, tailored options (not just the cheapest). Protect your family with cover that fits your life and budget.
            </p>
            <ul className="space-y-3">
               <li className="flex items-center text-lg gap-3">
                <Check className="h-6 w-6 text-green-400" />
                <span>Quotes sourced from four leading NZ insurers</span>
              </li>
               <li className="flex items-center text-lg gap-3">
                <Check className="h-6 w-6 text-green-400" />
                <span>No pushy sales. No obligation.</span>
              </li>
               <li className="flex items-center text-lg gap-3">
                <Check className="h-6 w-6 text-green-400" />
                <span>Takes about 2–3 minutes</span>
              </li>
            </ul>
          </div>
          <div ref={quoteWizardRef}>
            <QuoteWizardLife />
          </div>
        </div>
      </div>
    </section>
  );
};

const WhyCompareSection = () => {
  const { scrollToWizard } = useForm();
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Why compare life insurance quotes before you decide</h2>
        <p className="text-lg text-gray-600 text-center mb-12">
          Most Kiwis grab the first number they see. But prices and features vary — sometimes by a lot. When you compare term life insurance in NZ, you’ll notice:
        </p>
        <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
                <h3 className="font-bold text-xl mb-2">Same cover, different price.</h3>
                <p>Providers rate age, health, and smoker status differently. A quick comparison can shave dollars off your monthly premium.</p>
            </div>
            <div className="p-6">
                <h3 className="font-bold text-xl mb-2">Features matter.</h3>
                <p>Two “$500k life insurance” quotes can behave very differently — think <strong>level vs stepped premiums</strong>, built-in benefits, and claim definitions.</p>
            </div>
            <div className="p-6">
                <h3 className="font-bold text-xl mb-2">Your life changes.</h3>
                <p>Mortgage, kids, new job — your cover should flex with you, not trap you.</p>
            </div>
        </div>
        <div className="text-center mt-8">
            <Button onClick={scrollToWizard} size="lg">Start my personalised comparison</Button>
        </div>
      </div>
    </section>
  );
};

const SmartDealSection = () => {
    const { scrollToWizard } = useForm();
    return (
        <section className="bg-gray-50 py-16 sm:py-24">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Why the cheapest life insurance isn’t always the best deal</h2>
                    <p className="text-lg text-gray-600 mb-8">The lowest sticker price can cost more later. Watch for:</p>
                </div>
                <ul className="space-y-4 mb-8 max-w-2xl mx-auto">
                    <li className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                        <div><strong>Stepped vs level premiums.</strong> Stepped looks cheaper now but rises each year. <strong>Level premiums</strong> start higher but can be <strong>cheaper overall</strong> if you’ll hold cover long-term.</div>
                    </li>
                    <li className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                        <div><strong>Coverage gaps.</strong> Cheap policies can skip useful features (e.g., premium waiver, clear terminal-illness wording).</div>
                    </li>
                    <li className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                        <div><strong>Claim definitions.</strong> The fine print decides what gets paid — this is where “cheap” sometimes bites.</div>
                    </li>
                </ul>
                <div className="bg-white border-l-4 border-primary p-6 rounded-r-lg shadow-md max-w-2xl mx-auto">
                    <h4 className="font-bold text-lg mb-2">Example (illustrative):</h4>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="font-semibold text-gray-700">Cheapest today:</p>
                            <p className="text-sm text-gray-500">$500k life insurance (stepped)</p>
                            <p className="text-2xl font-bold text-primary mt-1">$30/month</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-700">Smarter alternative:</p>
                            <p className="text-sm text-gray-500">$500k life insurance (<strong>level</strong>)</p>
                            <p className="text-2xl font-bold text-primary mt-1">$36/month</p>
                        </div>
                    </div>
                     <p className="text-sm text-center mt-4 text-gray-600"><strong>Why it’s better:</strong> For a small step-up now, you can save over the years <strong>and</strong> avoid annual price creep — ideal while you raise kids or pay off the mortgage.</p>
                </div>
                 <p className="text-xs text-gray-500 text-center mt-4 max-w-2xl mx-auto">*Figures are illustrative; your premium depends on age, health, smoker status, occupation, and underwriting.</p>
                <div className="text-center mt-8">
                    <Button onClick={scrollToWizard} size="lg">Show me smarter options</Button>
                </div>
            </div>
        </section>
    );
};

const HowItWorksSection = () => {
    const { scrollToWizard } = useForm();
    const steps = [
        {
            icon: FileText,
            title: "1. Tell us a little about you (60 seconds).",
            description: "Age, smoker status, basic health, who relies on you."
        },
        {
            icon: Users,
            title: "2. We do the comparing for you.",
            description: "Our team reviews your details against four leading NZ insurers and builds a shortlist tailored to your needs and budget. (No instant on-page results.)"
        },
        {
            icon: ThumbsUp,
            title: "3. Your dedicated adviser gets in touch.",
            description: "We’ll contact you with your curated plan options, explain trade-offs (e.g., level vs stepped), and answer questions in plain English."
        },
        {
            icon: Check,
            title: "4. You choose and apply with confidence.",
            description: "We streamline the paperwork and keep you updated through underwriting."
        }
    ];

    return (
        <section className="bg-white py-16 sm:py-24">
            <div className="container mx-auto px-4 max-w-4xl">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How our NZ life insurance comparison works</h2>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-12">
                    {steps.map(step => (
                         <div key={step.title} className="flex items-start gap-4">
                            <div className="bg-primary/10 p-3 rounded-full mt-1">
                                <step.icon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                                <p className="text-gray-600">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-12">
                    <Button onClick={scrollToWizard} size="lg">Get my life insurance options</Button>
                </div>
            </div>
        </section>
    );
};

const StoriesSection = () => {
    const { scrollToWizard } = useForm();
    const stories = [
        { name: "Jess (30, non-smoker)", story: "Started with the cheapest term life quote. Our adviser recommended level premiums for a few dollars more per month — now she’s set for the next decade without annual shocks." },
        { name: "Kauri & Maia (young family)", story: "Their bank policy felt okay. We sourced similar-priced options from our four top insurers with clearer benefits and a premium-waiver add-on. Same budget, stronger safety net." },
        { name: "Rajan (45, ex-smoker)", story: "Rates looked high. After updating smoker status and comparing across our panel, he cut his premium without reducing cover." },
    ];
    return (
        <section className="bg-gray-50 py-16 sm:py-24">
            <div className="container mx-auto px-4 max-w-4xl">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How we helped real people get the best deal</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {stories.map(s => (
                        <div key={s.name} className="bg-white p-6 rounded-lg shadow-md border">
                            <p className="text-gray-600 mb-4">&quot;{s.story}&quot;</p>
                            <p className="font-bold text-right">- {s.name}</p>
                        </div>
                    ))}
                </div>
                 <div className="text-center mt-12">
                    <Button onClick={scrollToWizard} size="lg" variant="outline">Talk to an adviser</Button>
                </div>
            </div>
        </section>
    );
};

const WhatYouGetSection = () => {
    const { scrollToWizard } = useForm();
    const benefits = [
        "A curated shortlist of life insurance options from four leading NZ insurers",
        "Clear explanations of level vs stepped premiums and key definitions",
        "Best-value highlights (not just “cheapest”) based on your goals",
        "Human help from a dedicated, licensed NZ adviser — at no extra cost",
        "No obligation. Your pace, your call."
    ];
    return (
        <section className="bg-white py-16 sm:py-24">
            <div className="container mx-auto px-4 max-w-4xl">
                 <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">What you get</h2>
                 <div className="max-w-2xl mx-auto">
                    <ul className="space-y-4">
                        {benefits.map(b => (
                            <li key={b} className="flex items-start gap-3">
                                <Check className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                                <span>{b}</span>
                            </li>
                        ))}
                    </ul>
                 </div>
                <div className="text-center mt-12">
                    <Button onClick={scrollToWizard} size="lg">Get my life insurance options</Button>
                </div>
            </div>
        </section>
    );
};

const FinalCTASection = () => {
    const { scrollToWizard } = useForm();
    return (
        <section className="bg-primary text-white py-16 sm:py-24">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-2">Ready when you are</h2>
                <p className="text-lg text-primary-foreground/80 mb-8">Start now. You’ll be done before the kettle boils.</p>
                <div className="flex justify-center gap-4 flex-wrap">
                    <Button onClick={scrollToWizard} size="lg" variant="secondary">Get my life insurance options</Button>
                    <Button onClick={scrollToWizard} size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-primary">Talk to an adviser</Button>
                </div>
            </div>
        </section>
    );
};

const FaqSection = () => {
    const faqs = [
        { q: "What happens after I submit my details?", a: "We’ll review your information, compare plans from four leading NZ insurers, and a dedicated adviser will contact you with tailored options. There are no instant on-page results on the thank-you screen." },
        { q: "Is the cheapest life insurance always best?", a: "Not necessarily. Cheaper policies can have narrow coverage or premiums that rise every year. Many people get better value by checking **level vs stepped** and looking at built-in benefits." },
        { q: "How do level vs stepped premiums work in NZ?", a: "Stepped is cheaper upfront but increases annually. Level starts higher but can be cheaper overall if you’ll keep cover long-term." },
        { q: "How much life insurance do I need?", a: "Many Kiwis cover the mortgage, funeral costs, and several years of family living expenses. Your adviser will show ranges and you can adjust." },
        { q: "Do I need a medical exam?", a: "It depends on age, cover amount, and health. Some applications are straight-through; others may need medical information." },
        { q: "Can I switch providers later?", a: "Yes. Just make sure you don’t cancel your existing cover until the new policy is in force." },
        { q: "Do non-smoker rates make a difference?", a: "Yes. Non-smoker rates are typically lower. If you’ve quit, tell us — it can reduce your premium after qualifying periods." },
    ];

    return (
        <section className="bg-gray-50 py-16 sm:py-24">
            <div className="container mx-auto px-4 max-w-3xl">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Life insurance FAQs (NZ)</h2>
                 <Accordion type="single" collapsible className="w-full">
                    {faqs.map(faq => (
                        <AccordionItem value={faq.q} key={faq.q}>
                            <AccordionTrigger>{faq.q}</AccordionTrigger>
                            <AccordionContent>
                                <p dangerouslySetInnerHTML={{ __html: faq.a }}></p>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                 </Accordion>
            </div>
        </section>
    );
};

const ComplianceSection = () => {
    return (
        <section className="bg-gray-100 py-8">
            <div className="container mx-auto px-4 text-center text-xs text-gray-500 max-w-4xl">
                <h3 className="font-bold mb-2">Compliance</h3>
                <p>This page provides <strong>general information only</strong> and does not take into account your objectives, financial situation, or needs. Consider seeking <strong>advice from a licensed financial adviser</strong> and reading the relevant policy documents before making decisions. Quotes are <strong>indicative</strong> and subject to underwriting and eligibility.</p>
            </div>
        </section>
    );
}

export default function LifePage() {
  const { setQuoteWizardRef } = useForm();
  const quoteWizardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuoteWizardRef(quoteWizardRef);
  }, [setQuoteWizardRef]);

  return (
      <main className="w-full text-foreground bg-white">
        <div ref={quoteWizardRef}>
            <LifePageHero />
        </div>
        <Insurers />
        <WhyCompareSection />
        <SmartDealSection />
        <HowItWorksSection />
        <StoriesSection />
        <WhatYouGetSection />
        <FinalCTASection />
        <FaqSection />
        <ComplianceSection />
      </main>
  );
}

    
