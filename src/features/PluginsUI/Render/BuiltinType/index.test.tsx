import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DalleManifest } from '@/tools/dalle';
import { BuiltinToolsRenders } from '@/tools/renders';

import BuiltinType from './index';

// Mock Render component and useParseContent hook
vi.mock('@/tools/renders', () => ({
  BuiltinToolsRenders: {
    dalle3: vi.fn(() => <div>Test Renderer</div>),
    [DalleManifest.identifier]: vi.fn(() => <div>{DalleManifest.identifier}</div>),
  },
}));

// Mock Loading component
vi.mock('../Loading', () => ({
  default: vi.fn(() => <div>Loading...</div>),
}));

describe('BuiltinType', () => {
  it('should not render anything if identifier is not provided', () => {
    const { container } = render(<BuiltinType content="..." id="123" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should not render anything if content is not JSON and no identifier', () => {
    const { container } = render(<BuiltinType content="..." id="123" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should not render anything if identifier is unknown', () => {
    const { container } = render(<BuiltinType content="{}" id="123" identifier="unknown" />);
    expect(container).toBeEmptyDOMElement();
  });

  describe('DALL·E', () => {
    it('should render the correct renderer if identifier is dalle3', () => {
      render(<BuiltinType content='{"some":"data"}' id="123" identifier="dalle3" />);
      expect(BuiltinToolsRenders.dalle3).toHaveBeenCalled();
      expect(screen.getByText('Test Renderer')).toBeInTheDocument();
    });

    it('should render the correct renderer if is DALL·E ', () => {
      render(
        <BuiltinType content='{"some":"data"}' id="123" identifier={DalleManifest.identifier} />,
      );
      expect(BuiltinToolsRenders.dalle3).toHaveBeenCalled();
      expect(screen.getByText(DalleManifest.identifier)).toBeInTheDocument();
    });
  });
});
