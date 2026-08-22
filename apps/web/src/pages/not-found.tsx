import Link from '@/components/Link/Link';
import Title from '@/components/Title/Title';

// the Worker serves index.html for unknown paths, so the 404 is rendered here
export default function NotFound() {
  return (
    <div className="max-w-reading mx-medium my-huge w-full flex-col flex">
      <section className="mb-huge ease-in duration-300">
        <Title>Not found</Title>
        <p className="mb-large text-lg">
          There's nothing at this address. It may have moved, or it may never
          have been here at all.
        </p>
        <Link href="/">Back to the homepage</Link>
      </section>
    </div>
  );
}
