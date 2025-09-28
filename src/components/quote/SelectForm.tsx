
'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useForm } from '@/contexts/FormContext';
import type { Question } from '@/types';
import { motion } from 'framer-motion';

interface SelectFormProps {
  question: Question;
}

export default function SelectForm({ question }: SelectFormProps) {
  const { handleAnswer, formData } = useForm();
  const { id, Icon, question: questionText, description, options, field, nextStepId } = question;
  const [open, setOpen] = React.useState(false);
  const value = field ? formData[field] || '' : '';
  
  const handleSelect = (currentValue: string) => {
    setOpen(false);
    if (field) {
      handleAnswer(field, currentValue, nextStepId);
    }
  };

  return (
    <div className="flex flex-col items-center text-center text-gray-800">
        <h2 className="text-lg font-semibold sm:text-xl font-headline">{questionText}</h2>
        {description && <p className="mt-2 text-muted-foreground text-sm">{description}</p>}

        <div className="mt-8 w-full max-w-sm space-y-6 text-left">
            <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                {value
                    ? options?.find((option) => option.value === value)?.label
                    : 'Select town...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="Search town..." />
                    <CommandEmpty>No town found.</CommandEmpty>
                    <CommandGroup>
                        <ScrollArea className="h-72">
                        {options?.map((option) => (
                        <CommandItem
                            key={option.value}
                            value={option.value}
                            onSelect={handleSelect}
                        >
                            <Check
                                className={cn(
                                    'mr-2 h-4 w-4',
                                    value === option.value ? 'opacity-100' : 'opacity-0'
                                )}
                            />
                            {option.label}
                        </CommandItem>
                        ))}
                        </ScrollArea>
                    </CommandGroup>
                </Command>
            </PopoverContent>
            </Popover>
        </div>
    </div>
  );
}
