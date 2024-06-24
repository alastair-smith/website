import Link from 'next/link';

export type props = {
  children: React.ReactNode;
  className?: string;
  href: string;
  newTab?: boolean;
};

export const defaultUnderlinedLinkClasses =
  'focus:outline-none focus:ring-4 ring-violet-500 rounded px-small py-tiny self-start text-lg underline underline-offset-[6px] hover:underline-offset-2 ease-linear duration-100 hover:decoration-2';

const UnderlinedLink = ({
  children,
  className = '',
  href,
  newTab = false,
}: props) => (
  <Link
    href={href}
    className={`${defaultUnderlinedLinkClasses} ${className}`}
    target={newTab ? '_blank' : '_self'}
  >
    {children}
  </Link>
);

export default UnderlinedLink;
