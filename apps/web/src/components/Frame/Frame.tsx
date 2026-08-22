import type { ReactNode } from 'react';

// an amber mount for the number a page is about, cut wider at the sides
const Frame = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={`bg-amber-300 px-medium py-small ${className}`}>
    {children}
  </div>
);

export default Frame;
