import QuoteWizard from '@/components/quote/QuoteWizard';

const Hero = () => {
  return (
    <section
      className="relative w-full py-16 md:py-24 lg:py-32 bg-cover bg-center"
      style={{ backgroundImage: "url('https://placehold.co/1920x1080.png')" }}
      data-ai-hint="insurance agreement"
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold !leading-tight mb-4">
              Compare Insurance Quotes in NZ, Instantly.
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8">
              Save time and money by comparing quotes from New Zealand’s top insurance providers in minutes.
            </p>
            <ul className="space-y-3">
               <li className="flex items-center text-lg">
                <svg
                  className="h-6 w-6 text-primary mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span>Fast, Free & Simple</span>
              </li>
               <li className="flex items-center text-lg">
                 <svg
                  className="h-6 w-6 text-primary mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                 >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span>NZ's Most Trusted Insurers</span>
              </li>
               <li className="flex items-center text-lg">
                 <svg
                  className="h-6 w-6 text-primary mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                 >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span>No-obligation Quotes</span>
              </li>
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
