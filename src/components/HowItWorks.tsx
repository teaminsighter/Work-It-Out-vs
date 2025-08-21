import { FileText, ClipboardList, ThumbsUp } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const steps = [
  {
    icon: FileText,
    title: 'Fill Out Form',
    description: 'Provide a few details about your insurance needs using our simple and secure online form.',
  },
  {
    icon: ClipboardList,
    title: 'We Compare',
    description: 'Our system instantly compares policies from over 50 top NZ insurers to find the best match.',
  },
  {
    icon: ThumbsUp,
    title: 'You Save',
    description: 'You get a transparent, no-obligation quote that could save you hundreds on your premium.',
  },
];

const HowItWorks = () => {
  return (
    <section className="teal-gradient text-white py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30 text-sm">ABOUT OUR PROCESS PROGRAMME</Badge>
          <h2 className="text-3xl font-bold sm:text-4xl">
            How It Works
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative">
          {/* Dashed lines for larger screens */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-full">
            <div className="flex justify-center items-center h-full">
                <div className="w-2/3 border-t-2 border-dashed border-white/50 absolute top-8"></div>
            </div>
          </div>
          
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center relative z-10">
              <div className="bg-white/20 p-4 rounded-full mb-4">
                <step.icon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-200">{step.description}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-16">
          <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            GET YOUR FREE QUOTE
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
