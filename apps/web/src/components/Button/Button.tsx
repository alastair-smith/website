import type { ButtonHTMLAttributes } from 'react';

export const defaultButtonClasses =
  'focus:outline-none ring-violet-500 focus:ring-4 ease-linear duration-100 bg-rose-700 text-day hover:bg-rose-800 active:scale-90 border-4 border-rose-950 px-medium py-small rounded disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-rose-700 disabled:active:scale-100';

const Button = ({
  children,
  className,
  ...args
}: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button className={`${defaultButtonClasses} ${className}`} {...args}>
    {children}
  </button>
);

export default Button;
