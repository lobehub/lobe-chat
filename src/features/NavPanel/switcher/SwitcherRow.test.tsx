/**
 * @vitest-environment happy-dom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import SwitcherRow from './SwitcherRow';

// `@lobehub/ui` Avatar seeds its generated fallback (an SVG labelled with the
// resolved title) from `title`; without it a project that has no avatar
// rendered as an empty tile.
describe('SwitcherRow', () => {
  it('renders a title-seeded fallback when the item has no avatar', () => {
    const { container } = render(
      <SwitcherRow item={{ id: 'cloud', title: 'LobeHub Cloud' }} onSelect={vi.fn()} />,
    );

    expect(container.querySelector('svg[aria-label="LobeHub Cloud"]')).not.toBeNull();
  });

  it('renders a title-seeded fallback for CJK titles without an avatar', () => {
    const { container } = render(
      <SwitcherRow item={{ id: 'ningli', title: '宁麓置地' }} onSelect={vi.fn()} />,
    );

    expect(container.querySelector('svg[aria-label="宁麓置地"]')).not.toBeNull();
  });

  it('falls back to the title-seeded avatar when the image fails to load', () => {
    const { container } = render(
      <SwitcherRow
        item={{ avatar: 'https://example.com/missing.png', id: 'foundry', title: 'Foundry' }}
        onSelect={vi.fn()}
      />,
    );

    fireEvent.error(container.querySelector('img')!);

    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('svg[aria-label="Foundry"]')).not.toBeNull();
  });

  it('selects the item on click', () => {
    const onSelect = vi.fn();
    render(<SwitcherRow item={{ id: 'cloud', title: 'LobeHub Cloud' }} onSelect={onSelect} />);

    fireEvent.click(screen.getByText('LobeHub Cloud'));

    expect(onSelect).toHaveBeenCalledWith('cloud');
  });
});
