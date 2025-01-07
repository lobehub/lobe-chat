import { ModelIcon } from '@lobehub/icons';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import { CSSProperties, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { DiscoverModelItem } from '@/types/discover';

import ModelFeatureTags from '../../../features/ModelFeatureTags';

const { Paragraph, Title } = Typography;

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  banner: css`
    opacity: ${isDarkMode ? 0.9 : 0.4};
  `,
  container: css`
    cursor: pointer;

    position: relative;

    overflow: hidden;

    height: 100%;
    min-height: 162px;

    background: ${token.colorBgContainer};
    border-radius: ${token.borderRadiusLG}px;
    box-shadow: 0 0 1px 1px ${isDarkMode ? token.colorFillQuaternary : token.colorFillSecondary}
      inset;

    transition: box-shadow 0.2s ${token.motionEaseInOut};

    &:hover {
      box-shadow: 0 0 1px 1px ${isDarkMode ? token.colorFillSecondary : token.colorFill} inset;
    }
  `,
  desc: css`
    min-height: 44px;
    margin-block-end: 0 !important;
    color: ${token.colorTextDescription};
  `,
  id: css`
    margin-block-end: 0 !important;
    font-size: 12px;
    color: ${token.colorTextSecondary};
  `,
  tagBlue: css`
    color: ${token.geekblue};
    background: ${token.geekblue1};
  `,
  tagGreen: css`
    color: ${token.green};
    background: ${token.green1};
  `,
  time: css`
    color: ${token.colorTextDescription};
  `,
  title: css`
    margin-block-end: 0 !important;
    font-size: 18px !important;
    font-weight: bold;
  `,
  token: css`
    font-family: ${token.fontFamilyCode};
  `,
}));

export interface ModelCardProps extends DiscoverModelItem {
  className?: string;
  showCategory?: boolean;
  style?: CSSProperties;
}

const ModelCard = memo<ModelCardProps>(({ className, meta, identifier, style }) => {
  const { description, title, functionCall, vision, contextWindowTokens } = meta;
  const { t } = useTranslation('models');
  const { cx, styles } = useStyles();

  return (
    <Flexbox className={cx(styles.container, className)} gap={24} key={identifier} style={style}>
      <Flexbox
        gap={12}
        padding={16}
        style={{ overflow: 'hidden', position: 'relative' }}
        width={'100%'}
      >
        <Flexbox
          align={'center'}
          gap={12}
          horizontal
          style={{ overflow: 'hidden', position: 'relative' }}
          width={'100%'}
        >
          <ModelIcon model={identifier} size={32} type={'avatar'} />
          <Flexbox style={{ overflow: 'hidden', position: 'relative' }}>
            <Title className={styles.title} ellipsis={{ rows: 1, tooltip: title }} level={3}>
              {title}
            </Title>
            <Paragraph className={styles.id} ellipsis={{ rows: 1 }}>
              {identifier}
            </Paragraph>
          </Flexbox>
        </Flexbox>
        {description && (
          <Paragraph className={styles.desc} ellipsis={{ rows: 2 }}>
            {t(`${identifier}.description`)}
          </Paragraph>
        )}

        <ModelFeatureTags
          functionCall={functionCall}
          tokens={contextWindowTokens}
          vision={vision}
        />
      </Flexbox>
    </Flexbox>
  );
});

export default ModelCard;
