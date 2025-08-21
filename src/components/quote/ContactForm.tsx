'use client';

import { useForm as useReactHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from '@/contexts/FormContext';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { Question } from '@/types';
import { motion } from 'framer-motion';

interface ContactFormProps {
  question: Question;
}

const createSchema = (fields: string[] = []) => {
    const shape: { [key: string]: z.ZodType<any, any> } = {};
    if (fields.includes('name')) shape.name = z.string().min(2, 'Name must be at least 2 characters.');
    if (fields.includes('email')) shape.email = z.string().email('Invalid email address.');
    if (fields.includes('phone')) shape.phone = z.string().min(10, 'Phone number seems too short.');
    if (fields.includes('postcode')) shape.postcode = z.string().min(4, 'Postcode must be at least 4 digits.').max(4, 'Postcode must be at most 4 digits.');
    return z.object(shape);
};

export default function ContactForm({ question }: ContactFormProps) {
  const { handleAnswer, formData, setFormData } = useForm();
  const { id, Icon, question: questionText, description, fields = [], nextStepId } = question;

  const formSchema = createSchema(fields);
  type FormValues = z.infer<typeof formSchema>;
  
  const form = useReactHookForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: fields.reduce((acc, field) => {
        acc[field as keyof FormValues] = formData[field] || '';
        return acc;
    }, {} as FormValues)
  });

  function onSubmit(values: FormValues) {
    setFormData(prev => ({ ...prev, ...values }));
    handleAnswer(id, values, nextStepId);
  }

  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Icon className="mb-4 h-12 w-12 text-primary" />
      </motion.div>
      <h2 className="text-2xl font-bold sm:text-3xl font-headline">{questionText}</h2>
      {description && <p className="mt-2 text-muted-foreground">{description}</p>}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 w-full max-w-sm space-y-6 text-left">
          {fields.includes('name') && (
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {fields.includes('email') && (
             <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
          )}
          {fields.includes('phone') && (
            <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                    <Input placeholder="0400 123 456" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
          )}
          {fields.includes('postcode') && (
            <FormField
                control={form.control}
                name="postcode"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Postcode</FormLabel>
                    <FormControl>
                    <Input placeholder="e.g. 2000" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
          )}
          
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            Continue
          </Button>
        </form>
      </Form>
    </div>
  );
}
