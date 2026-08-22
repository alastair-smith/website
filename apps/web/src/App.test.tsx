import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from '@/App';
import { metadataFor, notFoundMetadata, siteMetadata } from '@/pages';

const renderAt = (pathname: string) =>
  render(
    <MemoryRouter initialEntries={[pathname]}>
      <App />
    </MemoryRouter>,
  );

describe('routing', () => {
  it('renders the page for a known route', () => {
    renderAt('/bort/about');

    expect(screen.getByRole('heading', { name: 'Bort' })).toBeInTheDocument();
  });

  // the Worker serves index.html for unknown paths, so this route owns the 404
  it('renders the not found page for an unknown route', () => {
    renderAt('/no-such-page');

    expect(
      screen.getByRole('heading', { name: 'Not found' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Back to the homepage' }),
    ).toBeInTheDocument();
  });
});

describe('metadataFor', () => {
  it('describes a known route', () => {
    expect(metadataFor('/bort')).toEqual(
      expect.objectContaining({ title: 'Bort Tracker | Alastair Smith' }),
    );
  });

  it('ignores a trailing slash, which react-router matches with either way', () => {
    expect(metadataFor('/bort/')).toEqual(metadataFor('/bort'));
    expect(metadataFor('/')).toEqual(siteMetadata);
  });

  it('falls back to the not found metadata', () => {
    expect(metadataFor('/no-such-page')).toEqual(notFoundMetadata);
  });
});
