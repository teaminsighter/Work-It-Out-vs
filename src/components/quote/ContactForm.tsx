
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ContactFormProps {
  question: Question;
}

const createSchema = (fields: string[] = []) => {
    const shape: { [key: string]: z.ZodType<any, any> } = {};
    if (fields.includes('name')) shape.name = z.string().min(2, 'Name must be at least 2 characters.');
    if (fields.includes('email')) shape.email = z.string().email('Invalid email address.');
    if (fields.includes('phone')) shape.phone = z.string().min(10, 'Phone number seems too short.');
    if (fields.includes('postcode')) shape.postcode = z.string().min(4, 'Postcode must be at least 4 digits.').max(4, 'Postcode must be at most 4 digits.');
    if (fields.includes('age')) shape.age = z.string().refine(val => !isNaN(parseInt(val, 10)) && parseInt(val, 10) > 0, { message: 'Please enter a valid age.' });
    if (fields.includes('yourAge')) shape.yourAge = z.string().refine(val => !isNaN(parseInt(val, 10)) && parseInt(val, 10) > 0, { message: 'Please enter a valid age.' });
    if (fields.includes('partnerAge')) shape.partnerAge = z.string().refine(val => !isNaN(parseInt(val, 10)) && parseInt(val, 10) > 0, { message: 'Please enter a valid age.' });
    if (fields.includes('yourSmokerStatus')) shape.yourSmokerStatus = z.enum(['yes', 'no']);
    if (fields.includes('partnerSmokerStatus')) shape.partnerSmokerStatus = z.enum(['yes', 'no']);
    return z.object(shape);
};

export default function ContactForm({ question }: ContactFormProps) {
  const { handleAnswer, formData, setFormData } = useForm();
  const { id, question: questionText, description, fields = [], nextStepId } = question;

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
    <div className="flex flex-col items-center text-center text-gray-800">
      <h2 className="text-lg font-semibold sm:text-xl font-headline">{questionText}</h2>
      {description && <p className="mt-2 text-muted-foreground text-sm">{description}</p>}
      
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
           {fields.includes('age') && (
            <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                    <Input placeholder="e.g. 35" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
          )}
          {fields.includes('yourAge') && (
            <FormField
                control={form.control}
                name="yourAge"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Your Age</FormLabel>
                    <FormControl>
                    <Input placeholder="e.g. 35" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
          )}
          {fields.includes('partnerAge') && (
            <FormField
                control={form.control}
                name="partnerAge"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Partner's Age</FormLabel>
                    <FormControl>
                    <Input placeholder="e.g. 34" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
          )}
          {fields.includes('yourSmokerStatus') && (
            <FormField
              control={form.control}
              name="yourSmokerStatus"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Are you a smoker?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="yes" />
                        </FormControl>
                        <FormLabel className="font-normal">Yes</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="no" />
                        </FormControl>
                        <FormLabel className="font-normal">No</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {fields.includes('partnerSmokerStatus') && (
            <FormField
              control={form.control}
              name="partnerSmokerStatus"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Is your partner a smoker?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="yes" />
                        </FormControl>
                        <FormLabel className="font-normal">Yes</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="no" />
                        </FormControl>
                        <FormLabel className="font-normal">No</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            Continue
          </Button>
        </form>
      </Form>
    </div>
  );
}
