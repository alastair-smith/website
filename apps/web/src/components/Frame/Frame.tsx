import type { ReactNode } from 'react';

// a little amber mount for the number a page is really about, wider at the sides
// than top and bottom the way a picture frame is cut. Square corners, like the
// ribbons it takes its colour from
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
