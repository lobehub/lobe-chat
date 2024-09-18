import { css, cx } from 'antd-style';
import { Center, Flexbox } from 'react-layout-kit';

const svgContainer = css`
  width: 100%;
  height: 100%;

  > svg {
    width: 100%;
    height: 100%;
  }
`;

interface SVGRendererProps {
  content: string;
}

const SVGRenderer = ({ content }: SVGRendererProps) => {
  return (
    <Flexbox align={'center'} className="svg-renderer" height={'100%'}>
      <Center className={cx(svgContainer)} dangerouslySetInnerHTML={{ __html: content }} />
    </Flexbox>
  );
};

export default SVGRenderer;
