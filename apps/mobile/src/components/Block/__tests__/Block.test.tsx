import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

import Block from '../Block';

describe('Block Component', () => {
  it('renders correctly with default props', () => {
    const { getByText } = render(
      <Block>
        <Text>Test Block</Text>
      </Block>,
    );

    expect(getByText('Test Block')).toBeTruthy();
  });

  it('renders with filled variant', () => {
    const { getByText } = render(
      <Block variant="filled">
        <Text>Filled Block</Text>
      </Block>,
    );

    expect(getByText('Filled Block')).toBeTruthy();
  });

  it('renders with outlined variant', () => {
    const { getByText } = render(
      <Block variant="outlined">
        <Text>Outlined Block</Text>
      </Block>,
    );

    expect(getByText('Outlined Block')).toBeTruthy();
  });

  it('renders with borderless variant', () => {
    const { getByText } = render(
      <Block variant="borderless">
        <Text>Borderless Block</Text>
      </Block>,
    );

    expect(getByText('Borderless Block')).toBeTruthy();
  });

  it('renders with shadow effect', () => {
    const { getByText } = render(
      <Block shadow>
        <Text>Shadow Block</Text>
      </Block>,
    );

    expect(getByText('Shadow Block')).toBeTruthy();
  });

  it('renders with glass effect', () => {
    const { getByText } = render(
      <Block glass>
        <Text>Glass Block</Text>
      </Block>,
    );

    expect(getByText('Glass Block')).toBeTruthy();
  });
});
