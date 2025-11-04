import { ColorScales, Flexbox, colorScales } from '@lobehub/ui-rn';

const FullDemo = () => {
  return (
    <Flexbox gap={16}>
      {Object.entries(colorScales).map(([name, scale]) => (
        <ColorScales key={name} midHighLight={9} name={name} scale={scale} />
      ))}
    </Flexbox>
  );
};

export default FullDemo;
