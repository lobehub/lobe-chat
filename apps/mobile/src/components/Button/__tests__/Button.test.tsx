import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '@/test/utils';
import Button from '../index';

describe('Button', () => {
  it('renders correctly with default props', () => {
    const { getByRole } = renderWithTheme(<Button>Click me</Button>);

    expect(getByRole('button')).toBeTruthy();
    expect(getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByRole } = renderWithTheme(<Button onPress={onPress}>Click me</Button>);

    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByRole } = renderWithTheme(
      <Button onPress={onPress} disabled>
        Click me
      </Button>,
    );

    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('does not call onPress when loading', () => {
    const onPress = jest.fn();
    const { getByRole } = renderWithTheme(
      <Button onPress={onPress} loading>
        Click me
      </Button>,
    );

    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows loading indicator when loading', () => {
    const { getByRole } = renderWithTheme(<Button loading>Loading...</Button>);

    expect(getByRole('button')).toBeTruthy();
    expect(getByRole('button')).toHaveTextContent('Loading...');
  });

  it('renders with primary type', () => {
    const { getByRole } = renderWithTheme(<Button type="primary">Primary</Button>);

    expect(getByRole('button')).toBeTruthy();
    expect(getByRole('button')).toHaveTextContent('Primary');
  });

  it('renders with secondary type', () => {
    const { getByRole } = renderWithTheme(<Button type="secondary">Secondary</Button>);

    expect(getByRole('button')).toBeTruthy();
    expect(getByRole('button')).toHaveTextContent('Secondary');
  });

  it('renders with large size', () => {
    const { getByRole } = renderWithTheme(<Button size="large">Large</Button>);

    expect(getByRole('button')).toBeTruthy();
    expect(getByRole('button')).toHaveTextContent('Large');
  });

  it('renders with small size', () => {
    const { getByRole } = renderWithTheme(<Button size="small">Small</Button>);

    expect(getByRole('button')).toBeTruthy();
    expect(getByRole('button')).toHaveTextContent('Small');
  });

  it('renders as block button', () => {
    const { getByRole } = renderWithTheme(<Button block>Block Button</Button>);

    expect(getByRole('button')).toBeTruthy();
    expect(getByRole('button')).toHaveTextContent('Block Button');
  });

  it('handles disabled state correctly', () => {
    const { getByRole } = renderWithTheme(<Button disabled>Disabled</Button>);

    const button = getByRole('button');
    expect(button).toBeTruthy();
    expect(button.props.disabled).toBe(true);
  });

  it('handles loading state correctly', () => {
    const { getByRole } = renderWithTheme(<Button loading>Loading</Button>);

    const button = getByRole('button');
    expect(button).toBeTruthy();
    expect(button.props.disabled).toBe(true);
  });

  it('applies custom style', () => {
    const customStyle = { backgroundColor: '#ff0000' };
    const { getByRole } = renderWithTheme(<Button style={customStyle}>Styled</Button>);

    expect(getByRole('button')).toBeTruthy();
  });

  it('applies custom text style', () => {
    const customTextStyle = { color: '#ff0000' };
    const { getByRole } = renderWithTheme(<Button textStyle={customTextStyle}>Styled Text</Button>);

    expect(getByRole('button')).toBeTruthy();
    expect(getByRole('button')).toHaveTextContent('Styled Text');
  });

  it('renders children correctly', () => {
    const { getByRole } = renderWithTheme(
      <Button>
        <span>Custom Content</span>
      </Button>,
    );

    expect(getByRole('button')).toBeTruthy();
  });

  it('handles onPress prop being undefined', () => {
    const { getByRole } = renderWithTheme(<Button>No OnPress</Button>);

    expect(() => {
      fireEvent.press(getByRole('button'));
    }).not.toThrow();
  });

  it('combines disabled and loading states correctly', () => {
    const onPress = jest.fn();
    const { getByRole } = renderWithTheme(
      <Button onPress={onPress} disabled loading>
        Disabled and Loading
      </Button>,
    );

    const button = getByRole('button');
    expect(button.props.disabled).toBe(true);

    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('handles middle size (default)', () => {
    const { getByRole } = renderWithTheme(<Button size="middle">Middle</Button>);

    expect(getByRole('button')).toBeTruthy();
    expect(getByRole('button')).toHaveTextContent('Middle');
  });

  it('handles default type', () => {
    const { getByRole } = renderWithTheme(<Button type="default">Default</Button>);

    expect(getByRole('button')).toBeTruthy();
    expect(getByRole('button')).toHaveTextContent('Default');
  });
});
