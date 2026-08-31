import Link from '@/components/Link/Link';
import Title from '@/components/Title/Title';

export default function NotFound() {
  return (
    <div className="max-w-reading mx-medium mb-huge lg:mt-huge w-full flex-col flex">
      <section className="mb-huge ease-in duration-300">
        <Title>Not found</Title>
        <p className="mb-large text-lg">
          There's nothing at this address. It may have moved, or it may never
          have been here at all.
        </p>
        <Link href="/" className="text-lg">
          Back to the homepage
        </Link>
      </section>
    </div>
  );
}
