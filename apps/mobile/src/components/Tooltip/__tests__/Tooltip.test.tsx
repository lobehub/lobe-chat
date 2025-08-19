import React from 'react';
import { Text } from 'react-native';
import { renderWithTheme } from '@/test/utils';
import Tooltip from '../index';

describe('Tooltip', () => {
  it('renders with content and children', () => {
    const { toJSON } = renderWithTheme(
      <Tooltip content="Tooltip text">
        <Text>Trigger</Text>
      </Tooltip>,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders with custom placement', () => {
    const { toJSON } = renderWithTheme(
      <Tooltip content="Tooltip text" placement="top">
        <Text>Trigger</Text>
      </Tooltip>,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders disabled tooltip', () => {
    const { toJSON } = renderWithTheme(
      <Tooltip content="Tooltip text" disabled>
        <Text>Trigger</Text>
      </Tooltip>,
    );
    expect(toJSON()).toBeTruthy();
  });
});
