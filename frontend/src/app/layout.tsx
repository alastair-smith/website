import { Inter } from 'next/font/google';
import Link from 'next/link';

import '@/app/globals.css';
import Image from 'next/image';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

const SocialLink = ({
  title,
  user,
  url,
  image,
}: {
  title: string;
  user: string;
  url: string;
  image: string;
}) => (
  <a href={url} rel="noopener" target="_blank">
    <Image src={image} alt={title} />
    <span>{title}</span>
    <span>{user}</span>
  </a>
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} grid grid-rows-[auto,1fr,auto] min-h-screen`}
      >
        <header className="bg-gray-200 py-4 row-start-1 row-end-2">
          <Link href="/">alsmith.dev</Link>
        </header>
        <main className="bg-gray-100 row-start-2 row-end-3">{children}</main>
        <footer className="bg-gray-200 py-4 row-start-3 row-end-4">
          <div>
            <SocialLink
              title="github"
              user="alastair-smith"
              url="https://github.com/alastair-smith"
              image=""
            />
            <SocialLink
              title="linkedin"
              user="alastair-smith-uk"
              url="https://www.linkedin.com/in/alastair-smith-uk/"
              image=""
            />
            <SocialLink
              title="email"
              user="contact@alsmith.dev"
              url="mailto:contact@alsmith.dev"
              image=""
            />
          </div>
        </footer>
      </body>
    </html>
  );
}
