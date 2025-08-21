"use client";

import { Progress } from '@/components/ui/progress';
import { useForm } from '@/contexts/FormContext';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
    isSimple?: boolean;
}

export default function ProgressBar({ isSimple = false }: ProgressBarProps) {
  const { progress } = useForm();

  if(isSimple) {
      return (
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="bg-[#2A81A8] h-full w-1/4"></div>
        </div>
      )
  }

  return (
    <div className="flex w-full items-center gap-4">
      <Progress value={progress} className="h-2 w-full" />
      <span className="text-sm font-semibold text-primary">{progress}%</span>
    </div>
  );
}
