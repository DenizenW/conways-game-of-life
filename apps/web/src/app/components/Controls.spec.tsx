import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Controls from './Controls';

describe('Controls', () => {
  const defaultProps = {
    running: false,
    onPlay: jest.fn(),
    onPause: jest.fn(),
    onStep: jest.fn(),
    onClear: jest.fn(),
    onRandomize: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when paused (running=false)', () => {
    it('renders Play button', () => {
      render(<Controls {...defaultProps} />);
      expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
    });

    it('renders enabled Step button', () => {
      render(<Controls {...defaultProps} />);
      const stepBtn = screen.getByRole('button', { name: /step/i });
      expect(stepBtn).toBeInTheDocument();
      expect(stepBtn).not.toBeDisabled();
    });

    it('calls onPlay when Play is clicked', async () => {
      const user = userEvent.setup();
      render(<Controls {...defaultProps} />);
      await user.click(screen.getByRole('button', { name: /play/i }));
      expect(defaultProps.onPlay).toHaveBeenCalledTimes(1);
    });

    it('calls onStep when Step is clicked', async () => {
      const user = userEvent.setup();
      render(<Controls {...defaultProps} />);
      await user.click(screen.getByRole('button', { name: /step/i }));
      expect(defaultProps.onStep).toHaveBeenCalledTimes(1);
    });
  });

  describe('Clear button', () => {
    it('renders and is enabled when paused', () => {
      render(<Controls {...defaultProps} />);
      const clearBtn = screen.getByRole('button', { name: /clear/i });
      expect(clearBtn).toBeInTheDocument();
      expect(clearBtn).not.toBeDisabled();
    });

    it('renders and is enabled when running', () => {
      render(<Controls {...defaultProps} running={true} />);
      const clearBtn = screen.getByRole('button', { name: /clear/i });
      expect(clearBtn).toBeInTheDocument();
      expect(clearBtn).not.toBeDisabled();
    });

    it('calls onClear when clicked', async () => {
      const user = userEvent.setup();
      render(<Controls {...defaultProps} />);
      await user.click(screen.getByRole('button', { name: /clear/i }));
      expect(defaultProps.onClear).toHaveBeenCalledTimes(1);
    });
  });

  describe('Randomize button', () => {
    it('renders and is enabled when paused', () => {
      render(<Controls {...defaultProps} />);
      const randomBtn = screen.getByRole('button', { name: /randomize/i });
      expect(randomBtn).toBeInTheDocument();
      expect(randomBtn).not.toBeDisabled();
    });

    it('renders and is enabled when running', () => {
      render(<Controls {...defaultProps} running={true} />);
      const randomBtn = screen.getByRole('button', { name: /randomize/i });
      expect(randomBtn).toBeInTheDocument();
      expect(randomBtn).not.toBeDisabled();
    });

    it('calls onRandomize when clicked', async () => {
      const user = userEvent.setup();
      render(<Controls {...defaultProps} />);
      await user.click(screen.getByRole('button', { name: /randomize/i }));
      expect(defaultProps.onRandomize).toHaveBeenCalledTimes(1);
    });
  });

  describe('when running (running=true)', () => {
    it('renders Pause button', () => {
      render(<Controls {...defaultProps} running={true} />);
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });

    it('renders disabled Step button', () => {
      render(<Controls {...defaultProps} running={true} />);
      const stepBtn = screen.getByRole('button', { name: /step/i });
      expect(stepBtn).toBeDisabled();
    });

    it('calls onPause when Pause is clicked', async () => {
      const user = userEvent.setup();
      render(<Controls {...defaultProps} running={true} />);
      await user.click(screen.getByRole('button', { name: /pause/i }));
      expect(defaultProps.onPause).toHaveBeenCalledTimes(1);
    });

    it('does not call onStep when Step is clicked (disabled)', async () => {
      const user = userEvent.setup();
      render(<Controls {...defaultProps} running={true} />);
      const stepBtn = screen.getByRole('button', { name: /step/i });
      await user.click(stepBtn);
      expect(defaultProps.onStep).not.toHaveBeenCalled();
    });
  });
});
