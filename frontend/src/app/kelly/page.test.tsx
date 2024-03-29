import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Page from './page';

describe('kelly page', () => {
  test('display an empty input and no gif on initial page load', () => {
    render(<Page />);

    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  test('update the text input as values are entered', async () => {
    const user = userEvent.setup();

    render(<Page />);

    const textInput = screen.getByRole('textbox');

    expect(textInput).toHaveValue('');

    await user.click(textInput);
    await user.keyboard('hello world');

    expect(textInput).toHaveValue('hello world');
  });

  test('displays the appropriate gif on submit', async () => {
    const user = userEvent.setup();

    render(<Page />);

    const textInput = screen.getByRole('textbox');

    expect(textInput).toHaveValue('');

    await user.click(textInput);
    await user.keyboard('hello world');

    expect(textInput).toHaveValue('hello world');

    const submitButton = screen.getByRole('button');

    await user.click(submitButton);

    const image = screen.getByTestId('image');

    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute(
      'src',
      'https://alsmith.dev/kelly/api?text=hello+world"&gif=1'
    );
  });
});
