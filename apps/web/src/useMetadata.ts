import { useEffect } from 'react';
import { metadataFor } from '@/pages';

// index.html speaks for the site; once react-router is driving, the route does
export const useMetadata = (pathname: string) => {
  useEffect(() => {
    const { title, description } = metadataFor(pathname);
    const set = (selector: string, attribute: string, value: string) =>
      document.querySelector(selector)?.setAttribute(attribute, value);

    document.title = title;
    set('meta[name="description"]', 'content', description);
    set('meta[property="og:title"]', 'content', title);
    set('meta[property="og:description"]', 'content', description);
    set('link[rel="canonical"]', 'href', window.location.href);
    set('meta[property="og:url"]', 'content', window.location.href);
  }, [pathname]);
};
