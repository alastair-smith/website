import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';

export type variant = 'underline' | 'highlight';

export type props = {
  children: ReactNode;
  className?: string;
  description?: ReactNode;
  href: string;
  variant?: variant;
};

// `group` sits on the anchor so hover fires from the description too
const sharedLinkClasses =
  'group focus:outline-none focus:ring-4 ring-violet-500 rounded py-tiny ease-linear duration-100';

const variantClasses: Record<variant, string> = {
  underline: 'px-small self-start text-lg',
  highlight: 'relative inline-block px-medium',
};

const labelClasses: Record<variant, string> = {
  underline:
    'underline underline-offset-[6px] group-hover:underline-offset-2 group-hover:decoration-2 ease-linear duration-100',
  highlight: '',
};

export const linkClasses = (variant: variant = 'underline') =>
  `${sharedLinkClasses} ${variantClasses[variant]}`;

const isExternal = (href: string) => /^(https?:|mailto:|tel:)/.test(href);

// the arrow lives inside the label, so the underline runs beneath it
const externalArrow = <span aria-hidden>&#8239;&#8599;</span>;

// every external link opens a new tab, whether or not it shows the arrow
const newTabWarning = <span className="sr-only"> (opens in a new tab)</span>;

const Link = ({
  children,
  className = '',
  description,
  href,
  variant = 'underline',
}: props) => {
  const classes = `${linkClasses(variant)} ${className}`;

  const external = isExternal(href);

  const label = (
    <>
      <span className={labelClasses[variant] || undefined}>
        {children}
        {external && variant === 'underline' && externalArrow}
        {external && newTabWarning}
      </span>
      {description && (
        <span className="italic text-base">
          {' - '}
          {description}
        </span>
      )}
    </>
  );

  const content =
    variant === 'highlight' ? (
      <>
        <span className="transition-all absolute inset-y-0 left-[50%] bg-rose-950 w-0 duration-500 group-hover:w-full rounded group-hover:left-0"></span>
        <span className="relative z-10 group-hover:text-day">{label}</span>
      </>
    ) : (
      label
    );

  return external ? (
    <a href={href} rel="noopener" target="_blank" className={classes}>
      {content}
    </a>
  ) : (
    <RouterLink to={href} className={classes}>
      {content}
    </RouterLink>
  );
};

export default Link;
