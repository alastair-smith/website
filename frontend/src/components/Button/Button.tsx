import { ButtonHTMLAttributes } from 'react';

export const defaultButtonClasses =
  'ease-linear duration-100 hover:bg-gray-200 active:scale-90 border-2 bg-white border-black px-medium py-small rounded';

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
