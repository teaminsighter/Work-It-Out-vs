
"use client";

import { cn } from '@/lib/utils';
import type { Option } from '@/types';
import { motion } from 'framer-motion';

interface OptionCardProps {
  option: Omit<Option, 'nextStepId'>;
  onClick: () => void;
  className?: string;
}

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

export default function OptionCard({ option, onClick, className }: OptionCardProps) {
  const { label, icon: Icon } = option;
  return (
    <motion.button
      variants={itemVariants}
      onClick={onClick}
      className={cn(
        'group relative w-full rounded-lg border-2 border-border bg-white p-5 text-center shadow-sm transition-all duration-200 hover:border-primary hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'overflow-hidden text-card-foreground',
        'flex flex-col items-center justify-center',
        className
      )}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex flex-col items-center justify-center">
        {Icon && <Icon className="mb-2 h-6 w-6 text-primary sm:mb-2" />}
        <span className="font-semibold">{label}</span>
      </div>
      <div className="absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 transform bg-primary transition-transform duration-300 ease-in-out group-hover:scale-x-100"></div>
    </motion.button>
  );
}
