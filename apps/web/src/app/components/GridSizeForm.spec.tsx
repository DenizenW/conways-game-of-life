import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GridSizeForm from './GridSizeForm';

describe('GridSizeForm', () => {
  const defaultProps = {
    currentWidth: 30,
    currentHeight: 30,
    onResize: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders width and height inputs with current values', () => {
    render(<GridSizeForm {...defaultProps} />);
    expect(screen.getByTestId('grid-width')).toHaveValue(30);
    expect(screen.getByTestId('grid-height')).toHaveValue(30);
  });

  it('renders visible labels for inputs', () => {
    render(<GridSizeForm {...defaultProps} />);
    expect(screen.getByLabelText('Grid width')).toBeInTheDocument();
    expect(screen.getByLabelText('Grid height')).toBeInTheDocument();
  });

  it('renders a submit button', () => {
    render(<GridSizeForm {...defaultProps} />);
    expect(screen.getByTestId('grid-submit')).toBeInTheDocument();
    expect(screen.getByTestId('grid-submit')).toHaveTextContent('Resize');
  });

  it('dispatches onResize with valid dimensions on submit', () => {
    render(<GridSizeForm {...defaultProps} />);
    fireEvent.change(screen.getByTestId('grid-width'), { target: { value: '50' } });
    fireEvent.change(screen.getByTestId('grid-height'), { target: { value: '40' } });
    fireEvent.submit(screen.getByTestId('grid-submit'));
    expect(defaultProps.onResize).toHaveBeenCalledWith(50, 40);
  });

  it('accepts boundary value 5 (minimum)', () => {
    render(<GridSizeForm {...defaultProps} />);
    fireEvent.change(screen.getByTestId('grid-width'), { target: { value: '5' } });
    fireEvent.change(screen.getByTestId('grid-height'), { target: { value: '5' } });
    fireEvent.submit(screen.getByTestId('grid-submit'));
    expect(defaultProps.onResize).toHaveBeenCalledWith(5, 5);
  });

  it('accepts boundary value 100 (maximum)', () => {
    render(<GridSizeForm {...defaultProps} />);
    fireEvent.change(screen.getByTestId('grid-width'), { target: { value: '100' } });
    fireEvent.change(screen.getByTestId('grid-height'), { target: { value: '100' } });
    fireEvent.submit(screen.getByTestId('grid-submit'));
    expect(defaultProps.onResize).toHaveBeenCalledWith(100, 100);
  });

  it('rejects value below minimum (4) with error', () => {
    render(<GridSizeForm {...defaultProps} />);
    fireEvent.change(screen.getByTestId('grid-width'), { target: { value: '4' } });
    fireEvent.submit(screen.getByTestId('grid-submit'));
    expect(defaultProps.onResize).not.toHaveBeenCalled();
    expect(screen.getByText('Min 5')).toBeInTheDocument();
  });

  it('rejects value above maximum (101) with error', () => {
    render(<GridSizeForm {...defaultProps} />);
    fireEvent.change(screen.getByTestId('grid-width'), { target: { value: '101' } });
    fireEvent.submit(screen.getByTestId('grid-submit'));
    expect(defaultProps.onResize).not.toHaveBeenCalled();
    expect(screen.getByText('Max 100')).toBeInTheDocument();
  });

  it('rejects zero with error', () => {
    render(<GridSizeForm {...defaultProps} />);
    fireEvent.change(screen.getByTestId('grid-width'), { target: { value: '0' } });
    fireEvent.submit(screen.getByTestId('grid-submit'));
    expect(defaultProps.onResize).not.toHaveBeenCalled();
    expect(screen.getByText('Min 5')).toBeInTheDocument();
  });

  it('rejects negative values with error', () => {
    render(<GridSizeForm {...defaultProps} />);
    fireEvent.change(screen.getByTestId('grid-width'), { target: { value: '-10' } });
    fireEvent.submit(screen.getByTestId('grid-submit'));
    expect(defaultProps.onResize).not.toHaveBeenCalled();
    expect(screen.getByText('Min 5')).toBeInTheDocument();
  });

  it('rejects non-numeric values with error', () => {
    render(<GridSizeForm {...defaultProps} />);
    // type="number" inputs coerce non-numeric text to empty string
    fireEvent.change(screen.getByTestId('grid-width'), { target: { value: 'abc' } });
    fireEvent.submit(screen.getByTestId('grid-submit'));
    expect(defaultProps.onResize).not.toHaveBeenCalled();
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('rejects empty values with error', () => {
    render(<GridSizeForm {...defaultProps} />);
    fireEvent.change(screen.getByTestId('grid-width'), { target: { value: '' } });
    fireEvent.submit(screen.getByTestId('grid-submit'));
    expect(defaultProps.onResize).not.toHaveBeenCalled();
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('rejects float values with error', () => {
    render(<GridSizeForm {...defaultProps} />);
    fireEvent.change(screen.getByTestId('grid-width'), { target: { value: '10.5' } });
    fireEvent.submit(screen.getByTestId('grid-submit'));
    expect(defaultProps.onResize).not.toHaveBeenCalled();
    expect(screen.getByText('Must be an integer')).toBeInTheDocument();
  });

  it('shows errors for both fields independently', () => {
    render(<GridSizeForm {...defaultProps} />);
    fireEvent.change(screen.getByTestId('grid-width'), { target: { value: '4' } });
    fireEvent.change(screen.getByTestId('grid-height'), { target: { value: '101' } });
    fireEvent.submit(screen.getByTestId('grid-submit'));
    expect(defaultProps.onResize).not.toHaveBeenCalled();
    expect(screen.getByText('Min 5')).toBeInTheDocument();
    expect(screen.getByText('Max 100')).toBeInTheDocument();
  });

  it('clears error when input value changes', () => {
    render(<GridSizeForm {...defaultProps} />);
    fireEvent.change(screen.getByTestId('grid-width'), { target: { value: '4' } });
    fireEvent.submit(screen.getByTestId('grid-submit'));
    expect(screen.getByText('Min 5')).toBeInTheDocument();
    fireEvent.change(screen.getByTestId('grid-width'), { target: { value: '10' } });
    expect(screen.queryByText('Min 5')).not.toBeInTheDocument();
  });
});
