export const Article = ({ children }: { children: React.ReactNode }) => (
  <article className="max-w-prose mx-medium my-huge w-full flex-col flex gap-8">
    {children}
  </article>
);

export const Header = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-huge flex flex-col gap-2">{children}</div>
);

// TODO have single heading component with anchor link and custom sizing via prop
export const Heading1 = ({ children }: { children: React.ReactNode }) => (
  <h1 className="uppercase font-bold text-4xl">{children}</h1>
);

export const Heading2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="uppercase font-bold text-2xl">{children}</h2>
);

// TODO use single value and get from locale
export const Date = ({ date }: { date: Date }) => (
  <p className="text-gray-700 italic">
    <time dateTime={date.toISOString()}>
      {date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}
    </time>
  </p>
);

export const Summary = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-slate-300 p-medium rounded border-2 border-black">
    <h2 className="font-bold text-xl mb-small">TL;DR</h2>
    {children}
  </div>
);

export const Section = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <section className={`flex flex-col gap-2 ${className}`}>{children}</section>
);

export const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h2 className="uppercase font-bold text-2xl">{children}</h2>
);
