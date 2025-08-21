import Image from 'next/image';
import { cn } from '@/lib/utils';

const logos = [
  { src: 'https://placehold.co/160x80.png', alt: 'Insurance Company 1', hint: 'company logo' },
  { src: 'https://placehold.co/160x80.png', alt: 'Insurance Company 2', hint: 'company logo' },
  { src: 'https://placehold.co/160x80.png', alt: 'Insurance Company 3', hint: 'company logo' },
  { src: 'https://placehold.co/160x80.png', alt: 'Insurance Company 4', hint: 'company logo' },
  { src: 'https://placehold.co/160x80.png', alt: 'Insurance Company 5', hint: 'company logo' },
  { src: 'https://placehold.co/160x80.png', alt: 'Insurance Company 6', hint: 'company logo' },
];

const Insurers = () => {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            NZ's Best Insurers
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            We compare NZ's top insurance companies to find you the best deal.
          </p>
        </div>
        <div className="relative w-full overflow-hidden">
          <div className="marquee flex gap-16">
            {[...logos, ...logos].map((logo, index) => (
              <div key={index} className="flex-shrink-0">
                <Image
                  className="max-h-12 w-auto object-contain"
                  src={logo.src}
                  alt={logo.alt}
                  width={160}
                  height={80}
                  data-ai-hint={logo.hint}
                />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
};

export default Insurers;
