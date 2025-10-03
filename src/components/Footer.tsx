import Link from 'next/link';
import Image from 'next/image';
import { Shield, Facebook, Twitter, Linkedin, Phone, Mail, Instagram, Youtube, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useForm } from '@/contexts/FormContext';

const Footer = () => {
  const { scrollToWizard } = useForm();

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Youtube, href: "#", label: "YouTube" }
  ];

  return (
    <footer className="relative overflow-hidden">
      {/* Glass Purple Background with Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/95 via-purple-800/90 to-indigo-900/95 backdrop-blur-xl"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-20 -left-20 w-40 h-40 bg-purple-400/20 rounded-full blur-xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-20 -right-20 w-60 h-60 bg-pink-400/20 rounded-full blur-xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/3 w-32 h-32 bg-indigo-400/15 rounded-full blur-xl"
          animate={{ 
            y: [0, -30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        
        {/* Top CTA Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Work It Out?
          </h2>
          <p className="text-purple-100 text-lg mb-8 max-w-2xl mx-auto">
            Get personalized insurance quotes and expert guidance. Start your journey to better coverage today.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={scrollToWizard}
                size="lg"
                className="bg-white text-purple-900 hover:bg-purple-50 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-lg font-semibold"
              >
                Compare now
                <motion.span
                  className="ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg"
                variant="outline"
                className="border-white text-purple-600 bg-white hover:bg-green-500 hover:text-white hover:border-green-500 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-lg font-semibold border-2"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Free Consultation
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Section */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Link href="/" className="flex items-center gap-2 mb-6">
               <Image 
                src="https://firebasestorage.googleapis.com/v0/b/quoteflow-insurance.firebasestorage.app/o/transparent_wit_horizontal-01.png?alt=media&token=d3b9cf1a-70aa-4010-a136-8eba88acb8d5"
                alt="Work It Out Logo"
                width={150}
                height={40}
                className="w-36 brightness-0 invert"
              />
            </Link>
            <p className="text-purple-100 text-sm leading-relaxed mb-6">
              Your ultimate insurance solution platform. Work it out with confidence and get the coverage you deserve.
            </p>
            
            {/* Social Media Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  className="p-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  viewport={{ once: true }}
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Legal Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-6 text-white">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/privacy-policy" className="text-purple-100 hover:text-white transition-colors duration-300">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="text-purple-100 hover:text-white transition-colors duration-300">Terms of Service</Link></li>
              <li><Link href="/disclosure" className="text-purple-100 hover:text-white transition-colors duration-300">Disclosure Statement</Link></li>
            </ul>
          </motion.div>
          
          {/* Important Websites */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-6 text-white">Important Links</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="https://www.fma.govt.nz" className="text-purple-100 hover:text-white transition-colors duration-300" target="_blank" rel="noopener noreferrer">Financial Markets Authority</a></li>
              <li><a href="https://www.ifso.nz" className="text-purple-100 hover:text-white transition-colors duration-300" target="_blank" rel="noopener noreferrer">Insurance & Financial Services Ombudsman</a></li>
            </ul>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-6 text-white">Contact Us</h3>
            <ul className="space-y-4 text-sm">
                <li className="flex items-center gap-3 text-purple-100">
                    <Phone className="h-5 w-5 text-purple-300" />
                    <span>0800 123 456</span>
                </li>
                <li className="flex items-center gap-3 text-purple-100">
                    <Mail className="h-5 w-5 text-purple-300" />
                    <span>hello@workitout.co.nz</span>
                </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div 
          className="pt-8 border-t border-white/20 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
        >
            <p className="text-sm text-purple-200">
              &copy; {new Date().getFullYear()} Work It Out. All rights reserved.
            </p>
            <p className="text-xs text-purple-300 mt-2 sm:mt-0">
              Licensed Financial Service Provider
            </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
