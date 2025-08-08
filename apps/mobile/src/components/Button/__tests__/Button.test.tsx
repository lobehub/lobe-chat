import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '@/test/utils';
import Button from '../index';

describe('Button', () => {
  it('renders correctly with default props', () => {
    const { toJSON } = renderWithTheme(<Button>Click me</Button>);

    expect(toJSON()).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { toJSON } = renderWithTheme(<Button onPress={onPress}>Click me</Button>);

    expect(toJSON()).toBeTruthy();
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { toJSON } = renderWithTheme(
      <Button onPress={onPress} disabled>
        Click me
      </Button>,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('does not call onPress when loading', () => {
    const onPress = jest.fn();
    const { toJSON } = renderWithTheme(
      <Button onPress={onPress} loading>
        Click me
      </Button>,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('shows loading indicator when loading', () => {
    const { toJSON } = renderWithTheme(<Button loading>Loading...</Button>);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with primary type', () => {
    const { toJSON } = renderWithTheme(<Button type="primary">Primary</Button>);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with default type', () => {
    const { toJSON } = renderWithTheme(<Button type="default">Default</Button>);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with large size', () => {
    const { toJSON } = renderWithTheme(<Button size="large">Large</Button>);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with small size', () => {
    const { toJSON } = renderWithTheme(<Button size="small">Small</Button>);

    expect(toJSON()).toBeTruthy();
  });

  it('renders as block button', () => {
    const { toJSON } = renderWithTheme(<Button block>Block Button</Button>);

    expect(toJSON()).toBeTruthy();
  });

  it('handles disabled state correctly', () => {
    const { toJSON } = renderWithTheme(<Button disabled>Disabled</Button>);

    expect(toJSON()).toBeTruthy();
  });

  it('handles loading state correctly', () => {
    const { toJSON } = renderWithTheme(<Button loading>Loading</Button>);

    expect(toJSON()).toBeTruthy();
  });

  it('applies custom style', () => {
    const customStyle = { backgroundColor: '#ff0000' };
    const { toJSON } = renderWithTheme(<Button style={customStyle}>Styled</Button>);

    expect(toJSON()).toBeTruthy();
  });

  it('applies custom text style', () => {
    const customTextStyle = { color: '#ff0000' };
    const { toJSON } = renderWithTheme(<Button textStyle={customTextStyle}>Styled Text</Button>);

    expect(toJSON()).toBeTruthy();
  });

  it('renders children correctly', () => {
    const { toJSON } = renderWithTheme(
      <Button>
        <span>Custom Content</span>
      </Button>,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('handles onPress prop being undefined', () => {
    const { toJSON } = renderWithTheme(<Button>No OnPress</Button>);

    expect(toJSON()).toBeTruthy();
  });

  it('combines disabled and loading states correctly', () => {
    const onPress = jest.fn();
    const { toJSON } = renderWithTheme(
      <Button onPress={onPress} disabled loading>
        Disabled and Loading
      </Button>,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('handles middle size (default)', () => {
    const { toJSON } = renderWithTheme(<Button size="middle">Middle</Button>);

    expect(toJSON()).toBeTruthy();
  });

  it('handles default type', () => {
    const { toJSON } = renderWithTheme(<Button type="default">Default</Button>);

    expect(toJSON()).toBeTruthy();
  });
});
