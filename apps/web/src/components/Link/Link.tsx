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

// `group` is on the anchor so the hover effects fire from anywhere inside it,
// including the description, while the decoration stays on the label alone
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

const Link = ({
  children,
  className = '',
  description,
  href,
  variant = 'underline',
}: props) => {
  const classes = `${linkClasses(variant)} ${className}`;

  const label = (
    <>
      <span className={labelClasses[variant] || undefined}>{children}</span>
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

  return isExternal(href) ? (
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
