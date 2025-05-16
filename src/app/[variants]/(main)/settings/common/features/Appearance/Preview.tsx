import { Block } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { rgba } from 'polished';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => {
  return {
    agent: css`
      padding: 4px;
      border-radius: 2px;
    `,
    agentActive: css`
      background: ${token.colorFillSecondary};
    `,
    bubble: css`
      padding: 6px;
      border: 1px solid ${rgba(token.colorBorderSecondary, 0.66)};
      border-radius: 3px;
      background-color: ${token.colorBgContainer};
    `,
    container: css`
      overflow: hidden;
      justify-self: flex-end;

      width: 332px;
      height: 200px;
      border: 1px solid ${token.colorBorder};
      border-radius: ${token.borderRadiusLG}px;

      background: ${token.colorBgLayout};
    `,
    conversation: css`
      background: ${token.colorBgContainerSecondary};
    `,
    header: css`
      border-block-end: 1px solid ${token.colorBorderSecondary};
    `,
    icon: css`
      flex: none;
      border-radius: 2px;
      background: ${token.colorFillSecondary};
    `,
    input: css`
      border-block-start: 1px solid ${token.colorBorderSecondary};
    `,
    nav: css`
      padding: 4px;
      border-inline-end: 1px solid ${token.colorBorderSecondary};
      background: ${token.colorBgLayout};
    `,
    sidebar: css`
      padding: 4px;
      border-inline-end: 1px solid ${token.colorBorderSecondary};
      background: ${token.colorBgLayout};
    `,
  };
});

const AgentItem = memo<{
  active?: boolean;
  color?: string;
}>(({ active, color }) => {
  const { cx, styles, theme } = useStyles();
  return (
    <Flexbox
      align={'center'}
      className={cx(styles.agent, active && styles.agentActive)}
      gap={4}
      horizontal
      width={'100%'}
    >
      <Flexbox
        className={styles.icon}
        height={12}
        style={{ background: color, borderRadius: '50%' }}
        width={12}
      />
      <Flexbox flex={1} gap={4}>
        <Flexbox
          className={styles.icon}
          height={2}
          style={{
            background: theme.colorTextTertiary,
          }}
          width={'66%'}
        />
        <Flexbox
          className={styles.icon}
          height={2}
          style={{
            background: theme.colorTextQuaternary,
          }}
          width={'100%'}
        />
      </Flexbox>
    </Flexbox>
  );
});

const Preview = memo(() => {
  const { styles, theme } = useStyles();

  const nav = (
    <Flexbox align={'center'} className={styles.nav} gap={8} width={24}>
      <Flexbox
        className={styles.icon}
        height={14}
        style={{ border: `2px solid ${theme.colorPrimary}`, borderRadius: '50%' }}
        width={14}
      />
      <Flexbox className={styles.icon} height={12} width={12} />
      <Flexbox className={styles.icon} height={12} width={12} />
      <Flexbox className={styles.icon} height={12} width={12} />
    </Flexbox>
  );

  const sidebar = (
    <Flexbox className={styles.sidebar} gap={4} width={72}>
      <Flexbox
        gap={4}
        paddingInline={2}
        style={{
          paddingTop: 4,
        }}
      >
        <Flexbox className={styles.icon} height={8} width={'50%'} />
        <Flexbox
          className={styles.icon}
          height={8}
          style={{
            background: theme.colorFillTertiary,
          }}
          width={'100%'}
        />
      </Flexbox>
      <AgentItem />
      <AgentItem active />
      <AgentItem />
      <AgentItem />
    </Flexbox>
  );

  const header = (
    <Flexbox
      align={'center'}
      className={styles.header}
      horizontal
      justify={'space-between'}
      padding={4}
    >
      <Flexbox align={'center'} gap={4} horizontal>
        <Flexbox className={styles.icon} height={12} style={{ borderRadius: '50%' }} width={12} />
        <Flexbox className={styles.icon} height={8} width={32} />
      </Flexbox>
      <Flexbox gap={2} horizontal>
        <Flexbox className={styles.icon} height={10} width={10} />
        <Flexbox className={styles.icon} height={10} width={10} />
      </Flexbox>
    </Flexbox>
  );

  const input = (
    <Flexbox
      align={'flex-end'}
      className={styles.input}
      height={48}
      justify={'flex-end'}
      padding={8}
    >
      <Flexbox
        className={styles.icon}
        height={12}
        style={{
          background: theme.colorPrimary,
        }}
        width={32}
      />
    </Flexbox>
  );

  return (
    <Block className={styles.container} horizontal shadow variant={'outlined'}>
      {nav}
      {sidebar}
      <Flexbox className={styles.conversation} flex={1}>
        {header}
        <Flexbox align={'flex-start'} flex={1} gap={8} padding={6}>
          <Flexbox align={'center'} gap={4} horizontal justify={'flex-end'} width={'100%'}>
            <Flexbox className={styles.bubble} gap={4} width={64}>
              <Flexbox
                className={styles.icon}
                height={2}
                style={{
                  background: theme.colorTextQuaternary,
                }}
                width={'100%'}
              />
              <Flexbox
                className={styles.icon}
                height={2}
                style={{
                  background: theme.colorTextQuaternary,
                }}
                width={'66%'}
              />
            </Flexbox>
            <Flexbox
              className={styles.icon}
              height={14}
              style={{ borderRadius: '50%' }}
              width={14}
            />
          </Flexbox>
          <Flexbox gap={4} horizontal>
            <Flexbox
              className={styles.icon}
              height={14}
              style={{ borderRadius: '50%' }}
              width={14}
            />
            <Flexbox className={styles.bubble} gap={4} width={160}>
              <Flexbox
                className={styles.icon}
                height={2}
                style={{
                  background: theme.colorTextQuaternary,
                }}
                width={'100%'}
              />
              <Flexbox
                className={styles.icon}
                height={2}
                style={{
                  background: theme.colorTextQuaternary,
                }}
                width={'66%'}
              />
              <Flexbox
                className={styles.icon}
                height={2}
                style={{
                  background: theme.colorTextQuaternary,
                }}
                width={'100%'}
              />
              <Flexbox
                className={styles.icon}
                height={2}
                style={{
                  background: theme.colorTextQuaternary,
                }}
                width={'100%'}
              />
              <Flexbox
                className={styles.icon}
                height={2}
                style={{
                  background: theme.colorTextQuaternary,
                }}
                width={'33%'}
              />
            </Flexbox>
          </Flexbox>
          <Flexbox align={'center'} gap={4} horizontal justify={'flex-end'} width={'100%'}>
            <Flexbox className={styles.bubble} gap={4} width={100}>
              <Flexbox
                className={styles.icon}
                height={2}
                style={{
                  background: theme.colorTextQuaternary,
                }}
                width={'100%'}
              />
              <Flexbox
                className={styles.icon}
                height={2}
                style={{
                  background: theme.colorTextQuaternary,
                }}
                width={'66%'}
              />
            </Flexbox>
            <Flexbox
              className={styles.icon}
              height={14}
              style={{ borderRadius: '50%' }}
              width={14}
            />
          </Flexbox>
        </Flexbox>
        {input}
      </Flexbox>
    </Block>
  );
});

export default Preview;
