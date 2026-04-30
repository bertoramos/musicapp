import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChordPlayer } from './ChordPlayer';
import * as audio from '../lib/audio';

// Mock the audio module
vi.mock('../lib/audio', () => ({
  playChord: vi.fn(),
}));

describe('ChordPlayer', () => {
  it('renders empty state message when no chords provided', () => {
    render(<ChordPlayer chords={[]} />);
    expect(screen.getByText(/Escribe acordes separados por/i)).toBeInTheDocument();
  });

  it('renders chord buttons when chords provided', () => {
    const chords = ['C', 'G', 'Am', 'F'];
    render(<ChordPlayer chords={chords} />);
    
    chords.forEach(chord => {
      expect(screen.getByText(chord)).toBeInTheDocument();
    });
  });

  it('calls playChord when a chord button is clicked', () => {
    const chords = ['C'];
    render(<ChordPlayer chords={chords} />);
    
    const button = screen.getByText('C');
    fireEvent.click(button);
    
    expect(audio.playChord).toHaveBeenCalledWith('C');
  });
});
