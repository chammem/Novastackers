import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { act } from 'react-dom/test-utils';
// Sample component for testing
function SampleComponent({ onClick }) {
  return (
    <button onClick={onClick}>Click Me</button>
  );
}

describe('SampleComponent', () => {
  it('renders the button', () => {
    render(<SampleComponent onClick={() => {}} />);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    render(<SampleComponent onClick={handleClick} />);

    const button = screen.getByText('Click Me');
    await userEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});