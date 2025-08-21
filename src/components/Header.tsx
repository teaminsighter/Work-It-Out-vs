'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Menu, X, Phone } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-gray-800">QuoteFlow</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-primary transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
             <a href="tel:0800123456" className="flex items-center gap-2 text-gray-600 hover:text-primary">
                <Phone className="h-4 w-4" />
                <span className="font-medium">0800 123 456</span>
             </a>
            <Button>Get Quote</Button>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'md:hidden bg-white transition-all duration-300 ease-in-out overflow-hidden',
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="flex flex-col px-4 py-2 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-primary transition-colors font-medium p-2 rounded-md hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t my-2"></div>
            <a href="tel:0800123456" className="flex items-center gap-2 text-gray-600 hover:text-primary p-2">
                <Phone className="h-4 w-4" />
                <span className="font-medium">0800 123 456</span>
             </a>
            <Button className="w-full mt-2">Get Quote</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
