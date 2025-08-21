import type { LucideIcon } from "lucide-react";
import type React from "react";

export interface FormData {
  [key: string]: any;
}

export interface Option {
  value: string;
  label: string;
  icon?: LucideIcon;
}

export interface Question {
  id: string;
  question: string;
  description?: string;
  Icon: LucideIcon;
  options?: Option[];
  fields?: string[];
  nextStepId?: string;
  getNextStepId?: (value: any) => string;
}

export type Questions = {
  [key: string]: Question;
};
