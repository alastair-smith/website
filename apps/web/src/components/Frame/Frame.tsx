import type { ReactNode } from 'react';

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
