
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-6 py-4 rounded-xl font-medium text-sm tracking-wide transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]";
  
  const variants = {
    // Endel uses dark grey buttons for primary actions
    primary: "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700",
    // Secondary could be white for contrast or just a lighter grey
    secondary: "bg-white text-black hover:bg-zinc-200 border border-white",
    // Outline matches the line-art style
    outline: "bg-transparent border border-zinc-700 text-zinc-300 hover:border-white hover:text-white"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
