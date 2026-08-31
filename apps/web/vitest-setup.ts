import '@testing-library/jest-dom/vitest';

// jsdom has no media queries, and Layout asks about prefers-reduced-motion
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

// nor the web animations API, which the ribbon slide in Layout drives directly
Element.prototype.getAnimations = () => [];
Element.prototype.animate = () =>
  ({ cancel: () => {}, finish: () => {} }) as Animation;

// jsdom warns rather than ignoring the scroll Layout does on every navigation
window.scrollTo = () => {};
