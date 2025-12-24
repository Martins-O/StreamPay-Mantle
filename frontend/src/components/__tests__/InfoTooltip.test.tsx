import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InfoTooltip } from '../InfoTooltip';

describe('InfoTooltip', () => {
  it('renders the help icon button', () => {
    render(<InfoTooltip content="Test tooltip content" />);
    const button = screen.getByRole('button', { name: /more information/i });
    expect(button).toBeInTheDocument();
  });

  it('displays tooltip content on hover', async () => {
    const user = userEvent.setup();
    const tooltipText = 'Helpful information here';

    render(<InfoTooltip content={tooltipText} />);

    const button = screen.getByRole('button', { name: /more information/i });
    await user.hover(button);

    // Wait for tooltip to appear (with delay)
    const tooltip = await screen.findByText(tooltipText, {}, { timeout: 1000 });
    expect(tooltip).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const customClass = 'custom-test-class';
    render(<InfoTooltip content="Test" className={customClass} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass(customClass);
  });

  it('supports different tooltip positions', () => {
    const { rerender } = render(<InfoTooltip content="Test" side="top" />);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<InfoTooltip content="Test" side="right" />);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<InfoTooltip content="Test" side="bottom" />);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<InfoTooltip content="Test" side="left" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('has accessible aria-label', () => {
    render(<InfoTooltip content="Test tooltip" />);
    const button = screen.getByLabelText('More information');
    expect(button).toBeInTheDocument();
  });
});
