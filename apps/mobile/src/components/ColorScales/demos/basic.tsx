import { ColorScales, Flexbox, colorScales } from '@lobehub/ui-rn';

const BasicDemo = () => {
  return (
    <Flexbox gap={16}>
      <ColorScales midHighLight={9} name="primary" scale={colorScales.primary} />
      <ColorScales midHighLight={9} name="red" scale={colorScales.red} />
      <ColorScales midHighLight={9} name="blue" scale={colorScales.blue} />
      <ColorScales midHighLight={9} name="green" scale={colorScales.green} />
    </Flexbox>
  );
};

export default BasicDemo;
