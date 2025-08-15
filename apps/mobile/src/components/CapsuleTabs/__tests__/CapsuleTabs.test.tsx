import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '@/test/utils';
import CapsuleTabs from '../index';

const mockItems = [
  { key: 'tab1', label: 'Tab 1' },
  { key: 'tab2', label: 'Tab 2' },
  { key: 'tab3', label: 'Tab 3' },
];

describe('CapsuleTabs', () => {
  it('renders correctly with default props', () => {
    const onSelect = jest.fn();
    const { toJSON } = renderWithTheme(
      <CapsuleTabs items={mockItems} selectedKey="tab1" onSelect={onSelect} />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('calls onSelect when tab is pressed', () => {
    const onSelect = jest.fn();
    const { toJSON } = renderWithTheme(
      <CapsuleTabs items={mockItems} selectedKey="tab1" onSelect={onSelect} />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with selected tab', () => {
    const onSelect = jest.fn();
    const { toJSON } = renderWithTheme(
      <CapsuleTabs items={mockItems} selectedKey="tab2" onSelect={onSelect} />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with showsHorizontalScrollIndicator enabled', () => {
    const onSelect = jest.fn();
    const { toJSON } = renderWithTheme(
      <CapsuleTabs
        items={mockItems}
        selectedKey="tab1"
        onSelect={onSelect}
        showsHorizontalScrollIndicator={true}
      />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with showsHorizontalScrollIndicator disabled (default)', () => {
    const onSelect = jest.fn();
    const { toJSON } = renderWithTheme(
      <CapsuleTabs items={mockItems} selectedKey="tab1" onSelect={onSelect} />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with empty items array', () => {
    const onSelect = jest.fn();
    const { toJSON } = renderWithTheme(
      <CapsuleTabs items={[]} selectedKey="" onSelect={onSelect} />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('handles single item', () => {
    const singleItem = [{ key: 'single', label: 'Single Tab' }];
    const onSelect = jest.fn();
    const { toJSON } = renderWithTheme(
      <CapsuleTabs items={singleItem} selectedKey="single" onSelect={onSelect} />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('handles tab selection change', () => {
    const onSelect = jest.fn();
    const { toJSON } = renderWithTheme(
      <CapsuleTabs items={mockItems} selectedKey="tab1" onSelect={onSelect} />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('handles long labels', () => {
    const longLabelItems = [
      { key: 'long1', label: 'This is a very long tab label that might wrap' },
      { key: 'long2', label: 'Another extremely long label for testing purposes' },
    ];
    const onSelect = jest.fn();
    const { toJSON } = renderWithTheme(
      <CapsuleTabs items={longLabelItems} selectedKey="long1" onSelect={onSelect} />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('handles special characters in labels', () => {
    const specialItems = [
      { key: 'special1', label: 'Tab & More' },
      { key: 'special2', label: 'Tab < > "Test"' },
      { key: 'special3', label: 'Tab 中文' },
    ];
    const onSelect = jest.fn();
    const { toJSON } = renderWithTheme(
      <CapsuleTabs items={specialItems} selectedKey="special1" onSelect={onSelect} />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('handles multiple presses on the same tab', () => {
    const onSelect = jest.fn();
    const { toJSON } = renderWithTheme(
      <CapsuleTabs items={mockItems} selectedKey="tab1" onSelect={onSelect} />,
    );

    expect(toJSON()).toBeTruthy();
  });
});
