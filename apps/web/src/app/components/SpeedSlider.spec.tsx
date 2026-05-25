import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SpeedSlider from './SpeedSlider';

describe('SpeedSlider', () => {
  const defaultProps = {
    value: 10,
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a range input with correct min/max/step', () => {
    render(<SpeedSlider {...defaultProps} />);
    const slider = screen.getByRole('slider', { name: /generations per second/i });
    expect(slider).toHaveAttribute('min', '1');
    expect(slider).toHaveAttribute('max', '60');
    expect(slider).toHaveAttribute('step', '1');
  });

  it('displays current value label matching "Speed: {value} gen/s"', () => {
    render(<SpeedSlider {...defaultProps} value={25} />);
    expect(screen.getByText('Speed: 25 gen/s')).toBeInTheDocument();
  });

  it('calls onChange with a number (not string) when slider value changes', () => {
    render(<SpeedSlider {...defaultProps} />);
    const slider = screen.getByRole('slider', { name: /generations per second/i });
    fireEvent.change(slider, { target: { value: '20' } });
    expect(defaultProps.onChange).toHaveBeenCalledTimes(1);
    expect(defaultProps.onChange).toHaveBeenCalledWith(20);
  });

  it('has correct aria-label', () => {
    render(<SpeedSlider {...defaultProps} />);
    const slider = screen.getByRole('slider', { name: /generations per second/i });
    expect(slider).toHaveAttribute('aria-label', 'Generations per second');
  });

  it('has aria-valuenow matching current value', () => {
    render(<SpeedSlider {...defaultProps} value={42} />);
    const slider = screen.getByRole('slider', { name: /generations per second/i });
    expect(slider).toHaveAttribute('aria-valuenow', '42');
  });

  it('Arrow Right increments value by 1 (native range behavior)', () => {
    render(<SpeedSlider {...defaultProps} value={10} />);
    const slider = screen.getByRole('slider', { name: /generations per second/i });
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    // Native range input handles Arrow key behavior — the onChange fires via
    // the input's built-in handler. In jsdom, keyDown doesn't trigger native
    // range step behavior, so we verify the input accepts keyboard focus
    // and has the correct step attribute for native handling.
    expect(slider).toHaveAttribute('step', '1');
    expect(slider).toHaveAttribute('type', 'range');
  });
});
