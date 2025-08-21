"use client";

import { Star, Quote, ShieldCheck, BarChart2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from 'framer-motion';


const testimonials = [
  {
    name: 'Sarah L.',
    role: 'Auckland Homeowner',
    quote: "The process was so simple and fast. I got a much better deal than I expected, and the advice was genuinely helpful. Highly recommend!",
    rating: 5,
    avatar: 'https://placehold.co/100x100.png',
    hint: 'person portrait'
  },
  {
    name: 'Mike P.',
    role: 'Small Business Owner',
    quote: "QuoteFlow saved me hours of research. Their comparison tool is top-notch, and I feel confident I've got the right cover for my business.",
    rating: 5,
    avatar: 'https://placehold.co/100x100.png',
    hint: 'person portrait'
  },
  {
    name: 'Jessica W.',
    role: 'Young Family',
    quote: "Finding the right life insurance felt overwhelming, but QuoteFlow made it easy to understand our options. We now have peace of mind.",
    rating: 5,
    avatar: 'https://placehold.co/100x100.png',
    hint: 'person portrait'
  },
  {
    name: 'Tom H.',
    role: 'First-time Buyer',
    quote: "As a first-time insurance buyer, the expert advice was invaluable. I found a great policy that fit my budget perfectly.",
    rating: 5,
    avatar: 'https://placehold.co/100x100.png',
    hint: 'person portrait'
  }
];

const TestimonialCard = ({ testimonial, className, animationProps }: any) => (
    <motion.div
        {...animationProps}
        className={className}
    >
        <Card className="flex flex-col justify-between shadow-xl h-full">
            <CardContent className="p-6">
                <Quote className="h-8 w-8 text-primary/50 mb-4" />
                <p className="text-gray-600 italic mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center">
                    <Avatar className="h-12 w-12 mr-4">
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint={testimonial.hint} />
                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-gray-900">{testimonial.name}</p>
                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                    <div className="ml-auto flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                            key={i}
                            className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                        />
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    </motion.div>
)

const Testimonials = () => {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Trusted by Kiwis Across New Zealand
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            See what our happy customers have to say about their experience.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 h-[600px] lg:h-[450px]">
            <TestimonialCard 
                testimonial={testimonials[0]}
                animationProps={{
                    initial: { opacity: 0, scale: 0.8, y: 50, x: -20, rotate: -5 },
                    whileInView: { opacity: 1, scale: 1, y: 0, x: 0, rotate: -8 },
                    transition: { duration: 0.5, delay: 0.1, type: 'spring', stiffness: 100 },
                    viewport: { once: true, amount: 0.5 }
                }}
                className="absolute top-0 left-0 lg:left-[5%] w-full max-w-md"
            />
            <TestimonialCard 
                testimonial={testimonials[1]}
                animationProps={{
                    initial: { opacity: 0, scale: 0.8, y: 50, x: 20, rotate: 5 },
                    whileInView: { opacity: 1, scale: 1, y: 0, x: 0, rotate: 6 },
                    transition: { duration: 0.5, delay: 0.2, type: 'spring', stiffness: 100 },
                    viewport: { once: true, amount: 0.5 }
                }}
                className="absolute bottom-0 right-0 lg:right-[5%] w-full max-w-md"
            />
            <TestimonialCard 
                testimonial={testimonials[2]}
                animationProps={{
                    initial: { opacity: 0, scale: 0.8, y: -50, x: -20, rotate: 3 },
                    whileInView: { opacity: 1, scale: 1, y: 0, x: 0, rotate: 4 },
                    transition: { duration: 0.5, delay: 0.3, type: 'spring', stiffness: 100 },
                    viewport: { once: true, amount: 0.5 }
                }}
                className="absolute top-1/2 left-1/4 -translate-y-1/2 w-full max-w-md hidden lg:block"
            />
             <TestimonialCard 
                testimonial={testimonials[3]}
                animationProps={{
                    initial: { opacity: 0, scale: 0.8, y: 50, x: 20, rotate: -3 },
                    whileInView: { opacity: 1, scale: 1, y: 0, x: 0, rotate: -5 },
                    transition: { duration: 0.5, delay: 0.4, type: 'spring', stiffness: 100 },
                    viewport: { once: true, amount: 0.5 }
                }}
                className="absolute top-1/3 right-[15%] w-full max-w-md hidden lg:block"
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center pt-12 mt-16">
            <div className="border border-dashed border-gray-300 rounded-lg p-8">
                <ShieldCheck className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900">No Obligation Quotes</h3>
                <p className="text-gray-600 mt-2">Your quotes are 100% free and you are under no obligation to accept any deal.</p>
            </div>
             <div className="border border-dashed border-gray-300 rounded-lg p-8">
                <BarChart2 className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900">We Make Comparison Easy</h3>
                <p className="text-gray-600 mt-2">We simplify the jargon and present the facts, making it easy to compare policies.</p>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
