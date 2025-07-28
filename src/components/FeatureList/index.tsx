import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { LucideIcon } from 'lucide-react';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token, isDarkMode, responsive }) => ({
  desc: css`
    width: 280px;
    margin-block-end: 0;
    color: ${token.colorTextSecondary};

    ${responsive.mobile} {
      line-height: ${token.lineHeight};
    }
  `,
  icon: css`
    color: ${isDarkMode ? token.blue : token.geekblue};
  `,
  iconCtn: css`
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: ${isDarkMode ? token.blue1 : token.geekblue1};
  `,
  title: css`
    margin-block-end: 0;
    font-size: ${token.fontSizeLG}px;
    font-weight: bold;
  `,
}));

export interface FeatureItem {
  avatar: LucideIcon;
  desc: string;
  title: string;
}
interface FeatureListProps {
  data: FeatureItem[];
}

const FeatureList = memo<FeatureListProps>(({ data }) => {
  const { styles } = useStyles();

  return (
    <Flexbox gap={32}>
      {data.map((item) => {
        return (
          <Flexbox align={'flex-start'} gap={24} horizontal key={item.title}>
            <Center className={styles.iconCtn}>
              <Icon className={styles.icon} icon={item.avatar} size={36} />
            </Center>
            <Flexbox gap={8}>
              <p className={styles.title}>{item.title}</p>
              <p className={styles.desc}>{item.desc}</p>
            </Flexbox>
          </Flexbox>
        );
      })}
    </Flexbox>
  );
});

export default FeatureList;
