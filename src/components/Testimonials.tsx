

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
  }
];

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

        <div className="relative min-h-[450px] mb-12">
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50, x: -20, rotate: -5 }}
                whileInView={{ opacity: 1, scale: 1, y: 0, x: 0, rotate: -8 }}
                transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 100 }}
                viewport={{ once: true, amount: 0.5 }}
                className="absolute top-0 left-0 lg:left-[10%] w-full max-w-md"
            >
                <Card className="flex flex-col justify-between shadow-xl">
                    <CardContent className="p-6">
                        <Quote className="h-8 w-8 text-primary/50 mb-4" />
                        <p className="text-gray-600 italic mb-6">"{testimonials[0].quote}"</p>
                        <div className="flex items-center">
                            <Avatar className="h-12 w-12 mr-4">
                                <AvatarImage src={testimonials[0].avatar} alt={testimonials[0].name} data-ai-hint={testimonials[0].hint} />
                                <AvatarFallback>{testimonials[0].name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-gray-900">{testimonials[0].name}</p>
                                <p className="text-sm text-gray-500">{testimonials[0].role}</p>
                            </div>
                            <div className="ml-auto flex items-center">
                                {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={`h-5 w-5 ${i < testimonials[0].rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                    fill="currentColor"
                                />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
             <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50, x: 20, rotate: 5 }}
                whileInView={{ opacity: 1, scale: 1, y: 0, x: 0, rotate: 6 }}
                transition={{ duration: 0.5, delay: 0.4, type: 'spring', stiffness: 100 }}
                viewport={{ once: true, amount: 0.5 }}
                className="absolute bottom-0 right-0 lg:right-[10%] w-full max-w-md"
            >
                <Card className="flex flex-col justify-between shadow-xl">
                     <CardContent className="p-6">
                        <Quote className="h-8 w-8 text-primary/50 mb-4" />
                        <p className="text-gray-600 italic mb-6">"{testimonials[1].quote}"</p>
                        <div className="flex items-center">
                            <Avatar className="h-12 w-12 mr-4">
                                <AvatarImage src={testimonials[1].avatar} alt={testimonials[1].name} data-ai-hint={testimonials[1].hint} />
                                <AvatarFallback>{testimonials[1].name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-gray-900">{testimonials[1].name}</p>
                                <p className="text-sm text-gray-500">{testimonials[1].role}</p>
                            </div>
                            <div className="ml-auto flex items-center">
                                {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={`h-5 w-5 ${i < testimonials[1].rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                    fill="currentColor"
                                />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center pt-12">
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
