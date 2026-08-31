// what each route calls itself; index.html describes the site as a whole

export type metadata = {
  title: string;
  description: string;
};

const name = 'Alastair Smith';

export const siteMetadata: metadata = {
  title: name,
  description:
    "Alastair Smith's personal site: a handful of side projects, and the places to find me.",
};

export const notFoundMetadata: metadata = {
  title: `Not found | ${name}`,
  description: 'There is nothing at this address.',
};

// keep in step with the routes in App.tsx and with public/sitemap.xml
const metadataByPathname: Record<string, metadata> = {
  '/': siteMetadata,
  '/potter': {
    title: `Potter Meme Generator | ${name}`,
    description:
      'Magic up a message to Harry: put your own words on the letter, then send it on.',
  },
  '/kelly': {
    title: `Kelly Meme Generator | ${name}`,
    description:
      "Send texts in a dilemma: rewrite the message on Kelly Rowland's spreadsheet, as a still or a gif.",
  },
  '/kelly/about': {
    title: `About the Kelly Meme Generator | ${name}`,
    description:
      'Why Kelly Rowland texts Nelly from a Microsoft Excel spreadsheet, and where this generator came from.',
  },
  '/bort': {
    title: `Bort Tracker | ${name}`,
    description:
      'A global count of people called Bort. Add yourself to the tally.',
  },
  '/bort/about': {
    title: `About the Bort Tracker | ${name}`,
    description:
      'The Itchy & Scratchy Land number plate scene that the Bort Tracker counts.',
  },
};

// react-router matches with or without a trailing slash, so this does too
const withoutTrailingSlash = (pathname: string) =>
  pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;

export const metadataFor = (pathname: string): metadata =>
  metadataByPathname[withoutTrailingSlash(pathname)] ?? notFoundMetadata;
