import { TextareaHTMLAttributes, forwardRef } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1 w-full">
        <label className="text-sm font-medium text-nature-700">{label}</label>
        <textarea
          ref={ref}
          className={`px-4 py-3 rounded-xl border bg-white min-h-[100px] resize-y ${error ? 'border-red-500 focus:ring-red-500' : 'border-nature-200 focus:ring-nature-500'} focus:ring-2 focus:border-transparent outline-none transition-all ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
