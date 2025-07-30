import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '@/mobile/test/utils';
import CapsuleTabs from '../index';

const mockItems = [
  { key: 'tab1', label: 'Tab 1' },
  { key: 'tab2', label: 'Tab 2' },
  { key: 'tab3', label: 'Tab 3' },
];

describe('CapsuleTabs', () => {
  it('renders correctly with default props', () => {
    const onSelect = jest.fn();
    const { getByText } = renderWithTheme(
      <CapsuleTabs items={mockItems} selectedKey="tab1" onSelect={onSelect} />,
    );

    expect(getByText('Tab 1')).toBeTruthy();
    expect(getByText('Tab 2')).toBeTruthy();
    expect(getByText('Tab 3')).toBeTruthy();
  });

  it('calls onSelect when tab is pressed', () => {
    const onSelect = jest.fn();
    const { getByText } = renderWithTheme(
      <CapsuleTabs items={mockItems} selectedKey="tab1" onSelect={onSelect} />,
    );

    fireEvent.press(getByText('Tab 2'));
    expect(onSelect).toHaveBeenCalledWith('tab2');
  });

  it('renders with selected tab', () => {
    const onSelect = jest.fn();
    const { getByText } = renderWithTheme(
      <CapsuleTabs items={mockItems} selectedKey="tab2" onSelect={onSelect} />,
    );

    expect(getByText('Tab 2')).toBeTruthy();
  });

  it('renders with showsHorizontalScrollIndicator enabled', () => {
    const onSelect = jest.fn();
    const { root } = renderWithTheme(
      <CapsuleTabs
        items={mockItems}
        selectedKey="tab1"
        onSelect={onSelect}
        showsHorizontalScrollIndicator={true}
      />,
    );

    expect(root).toBeTruthy();
  });

  it('renders with showsHorizontalScrollIndicator disabled (default)', () => {
    const onSelect = jest.fn();
    const { root } = renderWithTheme(
      <CapsuleTabs items={mockItems} selectedKey="tab1" onSelect={onSelect} />,
    );

    expect(root).toBeTruthy();
  });

  it('renders with empty items array', () => {
    const onSelect = jest.fn();
    const { queryByText } = renderWithTheme(
      <CapsuleTabs items={[]} selectedKey="" onSelect={onSelect} />,
    );

    expect(queryByText('Tab 1')).toBeNull();
  });

  it('handles single item', () => {
    const singleItem = [{ key: 'single', label: 'Single Tab' }];
    const onSelect = jest.fn();
    const { getByText } = renderWithTheme(
      <CapsuleTabs items={singleItem} selectedKey="single" onSelect={onSelect} />,
    );

    expect(getByText('Single Tab')).toBeTruthy();

    fireEvent.press(getByText('Single Tab'));
    expect(onSelect).toHaveBeenCalledWith('single');
  });

  it('handles tab selection change', () => {
    const onSelect = jest.fn();
    const { getByText, rerender } = renderWithTheme(
      <CapsuleTabs items={mockItems} selectedKey="tab1" onSelect={onSelect} />,
    );

    // Initially tab1 is selected
    expect(getByText('Tab 1')).toBeTruthy();

    // Select tab2
    fireEvent.press(getByText('Tab 2'));
    expect(onSelect).toHaveBeenCalledWith('tab2');

    // Re-render with tab2 selected
    rerenderWithTheme(<CapsuleTabs items={mockItems} selectedKey="tab2" onSelect={onSelect} />);

    expect(getByText('Tab 2')).toBeTruthy();
  });

  it('handles long labels', () => {
    const longLabelItems = [
      { key: 'long1', label: 'This is a very long tab label that might wrap' },
      { key: 'long2', label: 'Another extremely long label for testing purposes' },
    ];
    const onSelect = jest.fn();
    const { getByText } = renderWithTheme(
      <CapsuleTabs items={longLabelItems} selectedKey="long1" onSelect={onSelect} />,
    );

    expect(getByText('This is a very long tab label that might wrap')).toBeTruthy();
    expect(getByText('Another extremely long label for testing purposes')).toBeTruthy();
  });

  it('handles special characters in labels', () => {
    const specialItems = [
      { key: 'special1', label: 'Tab & More' },
      { key: 'special2', label: 'Tab < > "Test"' },
      { key: 'special3', label: 'Tab 中文' },
    ];
    const onSelect = jest.fn();
    const { getByText } = renderWithTheme(
      <CapsuleTabs items={specialItems} selectedKey="special1" onSelect={onSelect} />,
    );

    expect(getByText('Tab & More')).toBeTruthy();
    expect(getByText('Tab < > "Test"')).toBeTruthy();
    expect(getByText('Tab 中文')).toBeTruthy();
  });

  it('handles multiple presses on the same tab', () => {
    const onSelect = jest.fn();
    const { getByText } = renderWithTheme(
      <CapsuleTabs items={mockItems} selectedKey="tab1" onSelect={onSelect} />,
    );

    const tab1 = getByText('Tab 1');
    fireEvent.press(tab1);
    fireEvent.press(tab1);
    fireEvent.press(tab1);

    expect(onSelect).toHaveBeenCalledTimes(3);
    expect(onSelect).toHaveBeenCalledWith('tab1');
  });
});
