import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '../src/app/page';

describe('SimulationPage', () => {
  it('renders without crashing', () => {
    const { baseElement } = render(<Page />);
    expect(baseElement).toBeTruthy();
  });

  it('renders the canvas element', () => {
    render(<Page />);
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
  });

  it('renders the grid size form inputs', () => {
    render(<Page />);
    expect(screen.getByTestId('grid-width')).toBeInTheDocument();
    expect(screen.getByTestId('grid-height')).toBeInTheDocument();
    expect(screen.getByTestId('grid-submit')).toBeInTheDocument();
  });

  it('renders the generation counter at 0', () => {
    render(<Page />);
    expect(screen.getByTestId('gen-count')).toHaveTextContent('Generation: 0');
  });

  it('renders the page title', () => {
    render(<Page />);
    expect(screen.getByText("Conway's Game of Life")).toBeInTheDocument();
  });

  it('renders in paused state with cursor-pointer on canvas container', () => {
    render(<Page />);
    const canvas = screen.getByTestId('canvas');
    expect(canvas.parentElement).toHaveClass('cursor-pointer');
    expect(canvas.parentElement).not.toHaveClass('cursor-default');
  });

  it('shows Play button initially and switches to Pause when clicked', async () => {
    const user = userEvent.setup();
    render(<Page />);
    const playBtn = screen.getByRole('button', { name: /play/i });
    expect(playBtn).toBeInTheDocument();

    await user.click(playBtn);
    expect(screen.queryByRole('button', { name: /play/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
  });

  it('switches back to Play when Pause is clicked', async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(screen.getByRole('button', { name: /play/i }));
    await user.click(screen.getByRole('button', { name: /pause/i }));
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
  });

  it('advances exactly one generation when Step is clicked', async () => {
    const user = userEvent.setup();
    render(<Page />);
    expect(screen.getByTestId('gen-count')).toHaveTextContent('Generation: 0');
    await user.click(screen.getByRole('button', { name: /step/i }));
    expect(screen.getByTestId('gen-count')).toHaveTextContent('Generation: 1');
  });

  it('disables Step button while running', async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(screen.getByRole('button', { name: /play/i }));
    expect(screen.getByRole('button', { name: /step/i })).toBeDisabled();
  });
});
