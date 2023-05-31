import { Inter } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';

import '@/app/globals.css';

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
}) { // todo update skip link styling
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="absolute px-3 py-2 transition-all -translate-y-full focus:translate-y-0 bg-indigo-800 text-gray-100 text-base font-medium rounded-b-lg mx-4 focus:outline-none focus:ring-4 focus:ring-indigo-500  hover:no-underline hover:bg-indigo-900 hover:text-white z-10">Skip to main content</a>

        <div className={`${inter.className} grid grid-rows-[auto,1fr,auto] min-h-screen`}>
          <header className="bg-gray-200 py-4 row-start-1 row-end-2">
            <Link href="/">alsmith.dev</Link>
          </header>

          <main className="bg-gray-100 row-start-2 row-end-3" id="main-content">{children}</main>

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
        </div>
      </body>
    </html >
  );
}
