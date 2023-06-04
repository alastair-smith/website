import { ButtonHTMLAttributes } from 'react';

const Button = ({
  children,
  className,
  ...args
}: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={`hover:bg-gray-200 focus:bg-gray-200 active:scale-90 border-2 border-black px-medium py-small rounded ${className}`}
    {...args}
  >
    {children}
  </button>
);

export default Button;
