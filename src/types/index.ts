
import type { LucideIcon } from "lucide-react";
import type React from "react";

export interface FormData {
  [key: string]: any;
}

export interface Option {
  value: string;
  label: string;
  icon?: LucideIcon;
  nextStepId?: string;
}

export interface SubQuestion {
  id: string;
  question: string;
  options: Option[];
}

export interface MultipleField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'tel';
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
}

export interface SliderField {
  id: string;
  label: string;
  min: number;
  max: number;
  defaultValue: number;
  step: number;
}

export interface SingleField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'tel';
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
}

export interface Question {
  id: string;
  title?: string;
  question: string;
  description?: string;
  Icon: LucideIcon;
  options?: Option[];
  fields?: string[]; // For multi-field forms like ContactForm
  field?: string; // For single-field forms like SelectForm
  nextStepId?: string;
  getNextStepId?: (value: any, formData?: FormData) => string;
  multiSelect?: boolean;
  type?: 'slider';
  min?: number;
  max?: number;
  step?: number;
  multipleQuestions?: SubQuestion[]; // For combining multiple questions in one step
  multipleFields?: MultipleField[]; // For combining multiple input fields in one step
  sliderField?: SliderField; // For slider input
  singleField?: SingleField; // For single field input
}

export type Questions = {
  [key: string]: Question;
};
