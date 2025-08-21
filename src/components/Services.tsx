import { Heart, User, Home, Briefcase } from 'lucide-react';

const services = [
  {
    icon: Heart,
    title: 'Life Insurance',
    description: 'Protect your loved ones with a safety net for their future.',
  },
  {
    icon: User,
    title: 'Health Insurance',
    description: 'Get the best medical care without financial stress.',
  },
  {
    icon: Home,
    title: 'Home & Contents',
    description: "Secure your biggest asset and everything inside it.",
  },
  {
    icon: Briefcase,
    title: 'Business Insurance',
    description: 'Customised cover to protect your business and employees.',
  },
];

const Services = () => {
  return (
    <section className="teal-gradient text-white py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Free Insurance Quotes & Advice For
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {services.map((service, index) => (
            <div key={index} className="flex flex-col items-center p-6 bg-white/10 rounded-lg backdrop-blur-sm">
              <service.icon className="h-12 w-12 mb-4 text-white" />
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-200">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
