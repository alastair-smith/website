import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import Button from '@/components/Button/Button';

describe('component Button', () => {
  test('displays the provided child content', async () => {
    const buttonText = 'Submit';

    render(<Button>{buttonText}</Button>);

    expect(screen.getByRole('button')).toHaveTextContent(buttonText);
  });
});
