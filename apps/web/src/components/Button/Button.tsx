import type { ButtonHTMLAttributes } from 'react';

// the same rose the profile ribbon is painted in
export const defaultButtonClasses =
  'focus:outline-none ring-violet-500 focus:ring-4 ease-linear duration-100 bg-rose-700 text-day hover:bg-rose-800 active:scale-90 border-4 border-rose-950 px-medium py-small rounded';

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
