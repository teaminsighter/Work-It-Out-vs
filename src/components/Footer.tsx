import Link from 'next/link';
import { Shield, Facebook, Twitter, Linkedin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark-teal text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Shield className="h-8 w-8 text-white" />
              <span className="text-xl font-bold">QuoteFlow</span>
            </Link>
            <p className="text-gray-300 text-sm">
              Helping Kiwis find the best insurance deals from top providers across New Zealand. Compare and save with confidence.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy-policy" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="text-gray-300 hover:text-white">Terms of Service</Link></li>
              <li><Link href="/disclosure" className="text-gray-300 hover:text-white">Disclosure Statement</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Important Websites</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-300 hover:text-white" target="_blank" rel="noopener noreferrer">Financial Markets Authority</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white" target="_blank" rel="noopener noreferrer">Insurance & Financial Services Ombudsman</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2 text-gray-300">
                    <Phone className="h-4 w-4" />
                    <span>0800 123 456</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                    <Mail className="h-4 w-4" />
                    <span>hello@quoteflow.co.nz</span>
                </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-white/20 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} QuoteFlow. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 sm:mt-0">
                <a href="#" className="text-gray-400 hover:text-white"><Facebook className="h-5 w-5" /></a>
                <a href="#" className="text-gray-400 hover:text-white"><Twitter className="h-5 w-5" /></a>
                <a href="#" className="text-gray-400 hover:text-white"><Linkedin className="h-5 w-5" /></a>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
