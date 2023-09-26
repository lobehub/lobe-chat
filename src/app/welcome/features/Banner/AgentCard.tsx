import { Avatar, Spotlight } from '@lobehub/ui';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import { rgba } from 'polished';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { LobeAgentSession } from '@/types/session';

const { Paragraph, Title } = Typography;

const useStyles = createStyles(({ css, token, cx, stylish }) => ({
  container: cx(
    stylish.blur,
    css`
      cursor: pointer;

      position: relative;

      overflow: hidden;
      flex: 1;

      padding: 16px;

      background-color: ${rgba(token.colorBgContainer, 0.5)};
      border: 1px solid ${rgba(token.colorText, 0.2)};
      border-radius: ${token.borderRadiusLG}px;

      transition: all 400ms ${token.motionEaseOut};

      &:hover {
        background-color: ${rgba(token.colorBgElevated, 0.2)};
        border-color: ${token.colorText};
        box-shadow: 0 0 0 1px ${token.colorText};
      }

      ,
      &:active {
        scale: 0.98;
      }
    `,
  ),
  desc: css`
    margin: 0 !important;
  `,
  title: css`
    margin: 0 !important;
  `,
}));

export interface AgentCardProps {
  meta: LobeAgentSession['meta'];
}

const AgentCard = memo<AgentCardProps>(({ meta }) => {
  const { styles } = useStyles();
  return (
    <Flexbox className={styles.container} gap={8}>
      <Spotlight size={200} />
      <Avatar avatar={meta.avatar} background={meta.backgroundColor} />
      <Title className={styles.title} ellipsis level={5}>
        {meta.title}
      </Title>
      <Paragraph className={styles.desc} ellipsis={{ rows: 2 }} type="secondary">
        {meta.description}
      </Paragraph>
    </Flexbox>
  );
});

export default AgentCard;
