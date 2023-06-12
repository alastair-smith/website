import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-reading mx-medium my-huge w-full flex flex-col">
      <h1 className="font-black text-9xl uppercase">Alastair Smith</h1>
      <span>lorem ipsum about me</span>
      <Link href="/kelly">Kelly</Link>
    </div>
  );
}
