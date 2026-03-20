import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1 w-full">
        <label className="text-sm font-medium text-nature-700">{label}</label>
        <input
          ref={ref}
          className={`px-4 py-2.5 rounded-xl border bg-white ${error ? 'border-red-500 focus:ring-red-500' : 'border-nature-200 focus:ring-nature-500'} focus:ring-2 focus:border-transparent outline-none transition-all ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
