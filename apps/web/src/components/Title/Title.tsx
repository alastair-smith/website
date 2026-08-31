import type { ReactNode } from 'react';

const Title = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => (
  <h1
    className={`uppercase font-bold text-4xl mb-huge w-fit bg-amber-300 px-medium py-small ${className}`}
  >
    {children}
  </h1>
);

export default Title;
