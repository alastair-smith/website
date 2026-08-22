import type { ReactNode } from 'react';

// the amber from the projects ribbon, run behind the name like a highlighter
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
