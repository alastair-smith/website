import Link from '@/components/Link/Link';
import MemeGenerator from '@/components/MemeGenerator/MemeGenerator';

export default function Kelly() {
  return (
    <div className="max-w-reading mx-medium mb-huge lg:mt-huge w-full flex-col flex">
      <MemeGenerator
        type="kelly"
        title="Kelly"
        initialText="WHERE YOU AT? HOLLA WHEN YOU GET HERE"
        frameClassName="aspect-[4/3] bg-[url('/kelly-placeholder.jpg')]"
      />

      <Link href="/kelly/about" className="text-lg">
        Umm what is this?
      </Link>
    </div>
  );
}
