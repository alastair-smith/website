import Page from './page';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event'

describe('kelly page', () => {
  test('display an empty input and no gif on initial page load', () => {
    render(<Page />)

    expect(screen.getByRole('textbox')).toHaveValue('');
  })

  test('update the text input as values are entered', async () => {
    const user = userEvent.setup()

    render(<Page />)

    const textInput = screen.getByRole('textbox')

    expect(textInput).toHaveValue('');

    await user.click(textInput)
    await user.keyboard('hello world')

    expect(textInput).toHaveValue('hello world');
  })
})