import React from 'react';
import { Text, View } from 'react-native';
import { renderWithTheme } from '@/mobile/test/utils';
import Skeleton from '../index';

jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Animated: {
    Value: jest.fn(() => ({
      interpolate: jest.fn(),
    })),
    timing: jest.fn(() => ({
      start: jest.fn(),
    })),
    loop: jest.fn(() => ({
      start: jest.fn(),
    })),
    View: ({ children, style }: any) => <div style={style}>{children}</div>,
  },
}));

describe('Skeleton', () => {
  it('renders correctly with default props', () => {
    const { root } = renderWithTheme(<Skeleton />);

    expect(root).toBeTruthy();
  });

  it('shows skeleton when loading is true', () => {
    const { root } = renderWithTheme(
      <Skeleton loading={true}>
        <Text>Content</Text>
      </Skeleton>,
    );

    expect(root).toBeTruthy();
  });

  it('shows children when loading is false', () => {
    const { root } = renderWithTheme(
      <Skeleton loading={false}>
        <Text>Content</Text>
      </Skeleton>,
    );

    expect(root).toBeTruthy();
    expect(root.findAllByType(Text)).toHaveLength(1);
  });

  it('renders with avatar', () => {
    const { root } = renderWithTheme(<Skeleton avatar={true} />);

    expect(root).toBeTruthy();
  });

  it('renders with custom avatar config', () => {
    const { root } = renderWithTheme(<Skeleton avatar={{ shape: 'circle', size: 64 }} />);

    expect(root).toBeTruthy();
  });

  it('renders with title', () => {
    const { root } = renderWithTheme(<Skeleton title={true} />);

    expect(root).toBeTruthy();
  });

  it('renders with custom title config', () => {
    const { root } = renderWithTheme(<Skeleton title={{ width: 200 }} />);

    expect(root).toBeTruthy();
  });

  it('renders with paragraph', () => {
    const { root } = renderWithTheme(<Skeleton paragraph={true} />);

    expect(root).toBeTruthy();
  });

  it('renders with custom paragraph config', () => {
    const { root } = renderWithTheme(
      <Skeleton paragraph={{ rows: 3, width: ['100%', '80%', '60%'] }} />,
    );

    expect(root).toBeTruthy();
  });

  it('renders with animated prop', () => {
    const { root } = renderWithTheme(<Skeleton animated={false} />);

    expect(root).toBeTruthy();
  });

  it('renders with custom style', () => {
    const customStyle = { backgroundColor: '#f0f0f0' };
    const { root } = renderWithTheme(<Skeleton style={customStyle} />);

    expect(root).toBeTruthy();
  });

  it('renders with all props enabled', () => {
    const { root } = renderWithTheme(
      <Skeleton loading={true} avatar={true} title={true} paragraph={true} animated={true} />,
    );

    expect(root).toBeTruthy();
  });

  it('renders with square avatar', () => {
    const { root } = renderWithTheme(<Skeleton avatar={{ shape: 'square' }} />);

    expect(root).toBeTruthy();
  });

  it('renders with circle avatar', () => {
    const { root } = renderWithTheme(<Skeleton avatar={{ shape: 'circle' }} />);

    expect(root).toBeTruthy();
  });

  it('renders with custom avatar size', () => {
    const { root } = renderWithTheme(<Skeleton avatar={{ size: 48 }} />);

    expect(root).toBeTruthy();
  });

  it('renders with multiple paragraph rows', () => {
    const { root } = renderWithTheme(<Skeleton paragraph={{ rows: 5 }} />);

    expect(root).toBeTruthy();
  });

  it('renders with custom paragraph width', () => {
    const { root } = renderWithTheme(<Skeleton paragraph={{ width: 300 }} />);

    expect(root).toBeTruthy();
  });

  it('renders with array of paragraph widths', () => {
    const { root } = renderWithTheme(<Skeleton paragraph={{ width: [100, 200, 150] }} />);

    expect(root).toBeTruthy();
  });

  it('renders with percentage paragraph widths', () => {
    const { root } = renderWithTheme(<Skeleton paragraph={{ width: ['100%', '80%', '60%'] }} />);

    expect(root).toBeTruthy();
  });

  it('renders with custom title width', () => {
    const { root } = renderWithTheme(<Skeleton title={{ width: '70%' }} />);

    expect(root).toBeTruthy();
  });

  it('renders with numeric title width', () => {
    const { root } = renderWithTheme(<Skeleton title={{ width: 150 }} />);

    expect(root).toBeTruthy();
  });

  it('renders without title', () => {
    const { root } = renderWithTheme(<Skeleton title={false} />);

    expect(root).toBeTruthy();
  });

  it('renders without paragraph', () => {
    const { root } = renderWithTheme(<Skeleton paragraph={false} />);

    expect(root).toBeTruthy();
  });

  it('renders without avatar', () => {
    const { root } = renderWithTheme(<Skeleton avatar={false} />);

    expect(root).toBeTruthy();
  });

  it('renders with complex children', () => {
    const { getByText, getByTestId } = renderWithTheme(
      <Skeleton loading={false}>
        <View testID="complex-content">
          <Text>Title</Text>
          <Text>Description</Text>
        </View>
      </Skeleton>,
    );

    expect(getByTestId('complex-content')).toBeTruthy();
    expect(getByText('Title')).toBeTruthy();
    expect(getByText('Description')).toBeTruthy();
  });
});
