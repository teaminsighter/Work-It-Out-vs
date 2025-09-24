
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

export interface Question {
  id: string;
  question: string;
  description?: string;
  Icon: LucideIcon;
  options?: Option[];
  fields?: string[]; // For multi-field forms like ContactForm
  field?: string; // For single-field forms like SelectForm
  nextStepId?: string;
  getNextStepId?: (value: any) => string;
  multiSelect?: boolean;
}

export type Questions = {
  [key: string]: Question;
};
