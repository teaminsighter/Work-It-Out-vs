"use client";

import { Progress } from '@/components/ui/progress';
import { useForm } from '@/contexts/FormContext';

export default function ProgressBar() {
  const { progress, stepHistory } = useForm();

  return (
    <div className="flex w-full items-center gap-4">
      <Progress value={progress} className="h-2 w-full" />
      <span className="text-sm font-semibold text-primary">{progress}%</span>
    </div>
  );
}
