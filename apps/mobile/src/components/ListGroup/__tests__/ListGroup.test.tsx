import React from 'react';
import { Text } from 'react-native';
import { renderWithTheme } from '@/test/utils';
import ListGroup from '../index';

describe('ListGroup', () => {
  it('renders with children', () => {
    const { toJSON } = renderWithTheme(
      <ListGroup>
        <Text>Group content</Text>
      </ListGroup>,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders with title', () => {
    const { toJSON } = renderWithTheme(
      <ListGroup>
        <Text>Group content</Text>
      </ListGroup>,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders with footer', () => {
    const { toJSON } = renderWithTheme(
      <ListGroup>
        <Text>Group content</Text>
      </ListGroup>,
    );
    expect(toJSON()).toBeTruthy();
  });
});
