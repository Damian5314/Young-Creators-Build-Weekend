import { cn } from '@/shared/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'h-6 w-6 border-2',
  md: 'h-10 w-10 border-3',
  lg: 'h-14 w-14 border-4',
};

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={cn(
          'border-primary border-t-transparent rounded-full animate-spin',
          sizeClasses[size],
          className
        )}
      />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
