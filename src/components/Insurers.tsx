import Image from 'next/image';

const logos = [
  { src: 'https://firebasestorage.googleapis.com/v0/b/quoteflow-insurance.firebasestorage.app/o/health-logo1.webp?alt=media&token=8b1a5f1a-7253-47a7-a2c3-a3ecc27bedbb', alt: 'Insurance Company 1', hint: 'company logo' },
  { src: 'https://firebasestorage.googleapis.com/v0/b/quoteflow-insurance.firebasestorage.app/o/health-logo2.webp?alt=media&token=73bd1e36-30d0-4f89-b9e3-43a69252b91c', alt: 'Insurance Company 2', hint: 'company logo' },
  { src: 'https://firebasestorage.googleapis.com/v0/b/quoteflow-insurance.firebasestorage.app/o/health-logo3.webp?alt=media&token=2925601e-e5b0-4638-b92c-d647fe62e841', alt: 'Insurance Company 3', hint: 'company logo' },
  { src: 'https://firebasestorage.googleapis.com/v0/b/quoteflow-insurance.firebasestorage.app/o/health-logo4.webp?alt=media&token=2f16c66a-ddf7-4b79-b9fc-3299d1181023', alt: 'Insurance Company 4', hint: 'company logo' },
];

const Insurers = () => {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-purple-600 sm:text-4xl">
            NZ's Best Insurers
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            We compare NZ's top insurance companies to find you the best deal.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 md:gap-16 items-center justify-items-center max-w-4xl mx-auto">
          {logos.map((logo, index) => (
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
      </div>
    </section>
  );
};

export default Insurers;
