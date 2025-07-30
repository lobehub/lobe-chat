import React from 'react';
import { View, Text } from 'react-native';
import { renderWithTheme } from '@/mobile/test/utils';
import ListGroup from '../index';

describe('ListGroup', () => {
  it('renders correctly with default props', () => {
    const { root } = renderWithTheme(
      <ListGroup>
        <Text>List Item</Text>
      </ListGroup>,
    );

    expect(root).toBeTruthy();
  });

  it('renders children correctly', () => {
    const { root } = renderWithTheme(
      <ListGroup>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
        <Text>Item 3</Text>
      </ListGroup>,
    );

    expect(root).toBeTruthy();
    expect(root.findAllByType(Text)).toHaveLength(3);
  });

  it('applies custom style', () => {
    const customStyle = { backgroundColor: '#ff0000', padding: 20 };
    const { root } = renderWithTheme(
      <ListGroup style={customStyle}>
        <Text>Styled List</Text>
      </ListGroup>,
    );

    expect(root).toBeTruthy();
  });

  it('handles empty children', () => {
    const { root } = renderWithTheme(<ListGroup>{null}</ListGroup>);

    expect(root).toBeTruthy();
  });

  it('handles multiple child components', () => {
    const { root } = renderWithTheme(
      <ListGroup>
        <Text>Text Child</Text>
        <View testID="view-child">
          <Text>Nested Text</Text>
        </View>
      </ListGroup>,
    );

    expect(root).toBeTruthy();
    expect(root.findAllByType(Text)).toHaveLength(2);
    expect(root.findAllByType(View)).toHaveLength(2); // ListGroup + test View
  });

  it('handles React fragments as children', () => {
    const { root } = renderWithTheme(
      <ListGroup>
        <>
          <Text>Fragment Item 1</Text>
          <Text>Fragment Item 2</Text>
        </>
      </ListGroup>,
    );

    expect(root).toBeTruthy();
    expect(root.findAllByType(Text)).toHaveLength(2);
  });

  it('handles string children', () => {
    const { root } = renderWithTheme(<ListGroup>Plain text content</ListGroup>);

    expect(root).toBeTruthy();
  });

  it('handles array of children', () => {
    const items = ['Item A', 'Item B', 'Item C'];
    const { root } = renderWithTheme(
      <ListGroup>
        {items.map((item, index) => (
          <Text key={index}>{item}</Text>
        ))}
      </ListGroup>,
    );

    expect(root).toBeTruthy();
    expect(root.findAllByType(Text)).toHaveLength(3);
  });

  it('handles nested ListGroup components', () => {
    const { root } = renderWithTheme(
      <ListGroup>
        <Text>Parent Item</Text>
        <ListGroup>
          <Text>Nested Item</Text>
        </ListGroup>
      </ListGroup>,
    );

    expect(root).toBeTruthy();
    expect(root.findAllByType(Text)).toHaveLength(2);
  });

  it('handles complex nested structures', () => {
    const { root } = renderWithTheme(
      <ListGroup>
        <View testID="section-1">
          <Text>Section 1</Text>
          <View testID="subsection">
            <Text>Subsection</Text>
          </View>
        </View>
        <View testID="section-2">
          <Text>Section 2</Text>
        </View>
      </ListGroup>,
    );

    expect(root).toBeTruthy();
    expect(root.findAllByType(Text)).toHaveLength(3);
    expect(root.findAllByType(View)).toHaveLength(4); // ListGroup + 3 test Views
  });

  it('handles style merging correctly', () => {
    const style1 = { backgroundColor: '#ff0000' };
    const style2 = { padding: 10 };
    const { root } = renderWithTheme(
      <ListGroup style={[style1, style2]}>
        <Text>Multi-style List</Text>
      </ListGroup>,
    );

    expect(root).toBeTruthy();
  });

  it('handles undefined style', () => {
    const { root } = renderWithTheme(
      <ListGroup style={undefined}>
        <Text>Undefined Style</Text>
      </ListGroup>,
    );

    expect(root).toBeTruthy();
  });
});
