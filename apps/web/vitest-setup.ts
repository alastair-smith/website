import '@testing-library/jest-dom/vitest';

// jsdom has no media queries, and Layout asks about prefers-reduced-motion on
// every render; nothing under test cares which answer it gets
window.matchMedia = (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList;

// nor does jsdom have the web animations API, which the ribbon slide in Layout
// drives directly. There is no layout to animate here either, so the stubs only
// have to be callable: nothing has ever started, and nothing starts now
Element.prototype.getAnimations = () => [];
Element.prototype.animate = () =>
  ({ cancel: () => {}, finish: () => {} }) as Animation;

// Layout sends the page back to the top on every navigation, and jsdom would
// rather warn about that than ignore it
window.scrollTo = () => {};
