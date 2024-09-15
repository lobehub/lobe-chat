import { createStyles } from 'antd-style';
import { ReactNode, memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import ArtifactIcon from './Icon';

const useStyles = createStyles(({ css, token }) => ({
  avatar: css`
    background: ${token.colorFillQuaternary};
    border-inline-end: 1px solid ${token.colorSplit};
  `,
  container: css`
    cursor: pointer;

    margin-block-start: 12px;

    color: ${token.colorText};

    border: 1px solid ${token.colorBorder};
    border-radius: 8px;
    box-shadow: ${token.boxShadowTertiary};

    &:hover {
      background: ${token.colorFillQuaternary};
    }
  `,
  desc: css`
    font-size: 12px;
    color: ${token.colorTextTertiary};
  `,
  title: css`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;

    text-overflow: ellipsis;
  `,
}));

interface ArtifactProps {
  children: ReactNode;
  identifier: string;
  title: string;
  type: string;
}

const Render = memo<ArtifactProps>(({ identifier, title, type, children }) => {
  const { styles } = useStyles();

  const str = (children as string).toString?.();

  return (
    <Flexbox className={styles.container} gap={16} width={'100%'}>
      <Flexbox align={'center'} flex={1} horizontal>
        <Center className={styles.avatar} height={64} horizontal width={64}>
          <ArtifactIcon type={type} />
        </Center>
        <Flexbox paddingBlock={8} paddingInline={12}>
          <Flexbox className={styles.title}>{title}</Flexbox>
          <Flexbox className={styles.desc}>
            {identifier} · {str?.length}
          </Flexbox>
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
});

export default Render;
