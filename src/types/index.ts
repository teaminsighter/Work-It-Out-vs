import type { LucideIcon } from "lucide-react";
import type React from "react";

export interface FormData {
  [key: string]: any;
}

export interface Option {
  value: string;
  label: string;
  icon?: LucideIcon;
  nextStepId: string;
}

export interface Question {
  id: string;
  question: string;
  description?: string;
  Icon: LucideIcon;
  options?: Option[];
  component?: React.ComponentType<any>;
  getNextStepId?: (value: string) => string;
}

export type Questions = {
  [key: string]: Question;
};
