import { css, cx } from 'antd-style';
import { FC, ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const container = css`
  height: inherit;
  padding-block: 0;
  padding-inline: 8px;
`;

interface InnerContainerProps {
  bottomAddons?: ReactNode;
  children: ReactNode;
  expand?: boolean;
  textAreaLeftAddons?: ReactNode;
  textAreaRightAddons?: ReactNode;
  topAddons?: ReactNode;
}

const InnerContainer: FC<InnerContainerProps> = memo(
  ({ children, expand, textAreaRightAddons, textAreaLeftAddons, bottomAddons, topAddons }) =>
    expand ? (
      <Flexbox className={cx(container)} gap={8}>
        <Flexbox gap={8} horizontal justify={'flex-end'}>
          {textAreaLeftAddons}
          {textAreaRightAddons}
        </Flexbox>
        {children}
        {topAddons}
        {bottomAddons}
      </Flexbox>
    ) : (
      <Flexbox align={'flex-end'} className={cx(container)} gap={8} horizontal>
        {textAreaLeftAddons}
        {children}
        {textAreaRightAddons}
      </Flexbox>
    ),
);

export default InnerContainer;
