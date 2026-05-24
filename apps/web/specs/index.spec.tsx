import React from 'react';
import { render, screen } from '@testing-library/react';
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
});
