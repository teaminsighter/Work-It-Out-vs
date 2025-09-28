
'use client';

import { useState }from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Menu, X, Phone } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useForm } from '@/contexts/FormContext';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { scrollToWizard } = useForm();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="absolute top-0 left-0 w-full z-50 pt-6">
      <div className="container mx-auto px-4">
        <div className="relative bg-white rounded-xl shadow-md w-full md:w-[70%] mx-auto">
          <div className="flex justify-between items-center h-20 px-6">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="https://firebasestorage.googleapis.com/v0/b/quoteflow-insurance.firebasestorage.app/o/logo-horizontal-01.png?alt=media&token=c195f1a3-a9c8-4fe7-a36c-941e719582d9"
                alt="QuoteFlow Logo"
                width={150}
                height={40}
                className="w-36"
              />
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 hover:text-primary transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-4">
               <a href="tel:0800123456" className="flex items-center gap-2 text-gray-700 hover:text-primary">
                  <Phone className="h-4 w-4" />
                  <span className="font-medium">0800 123 456</span>
               </a>
              <Button onClick={scrollToWizard} className="bg-accent hover:bg-accent/90 text-accent-foreground">Get Quote</Button>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
                {isOpen ? <X className="h-6 w-6 text-gray-800" /> : <Menu className="h-6 w-6 text-gray-800" />}
              </button>
            </div>
          </div>
           {/* Mobile Menu */}
          <div
            className={cn(
              'md:hidden bg-white rounded-b-xl shadow-lg transition-all duration-300 ease-in-out overflow-hidden',
              isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            )}
          >
            <div className="flex flex-col px-4 py-2 gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-gray-800 hover:text-primary transition-colors font-medium p-2 rounded-md hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t my-2"></div>
                <a href="tel:0800123456" className="flex items-center gap-2 text-gray-800 hover:text-primary p-2">
                    <Phone className="h-4 w-4" />
                    <span className="font-medium">0800 123 456</span>
                 </a>
                <Button className="w-full mt-2" onClick={() => { scrollToWizard(); setIsOpen(false); }}>Get Quote</Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
