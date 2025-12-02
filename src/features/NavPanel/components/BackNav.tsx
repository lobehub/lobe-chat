import { ActionIcon, Button } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ChevronLeftIcon } from 'lucide-react';
import { PropsWithChildren, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { useNavigate } from 'react-router-dom';

import { DESKTOP_HEADER_ICON_SIZE } from '@/const/layoutTokens';

import TogglePanelButton from './TogglePanelButton';

const useStyles = createStyles(({ css, token }) => ({
  button: css`
    height: 32px;
    padding-inline-start: 4px;
    font-size: 13px;
    color: ${token.colorTextSecondary};

    &:hover {
      color: ${token.colorText};
    }
  `,
}));

const BackNav = memo<PropsWithChildren>(({ children }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const { styles } = useStyles();
  let leftContent;
  if (!children) {
    leftContent = (
      <Button
        className={styles.button}
        icon={ChevronLeftIcon}
        onClick={() => navigate('/')}
        type={'text'}
      >
        {t('back')}
      </Button>
    );
  } else {
    leftContent = (
      <Flexbox align={'center'} gap={4} horizontal>
        <ActionIcon
          icon={ChevronLeftIcon}
          onClick={() => navigate('/')}
          size={DESKTOP_HEADER_ICON_SIZE}
        />
        {children}
      </Flexbox>
    );
  }
  return (
    <Flexbox align={'center'} gap={4} horizontal justify={'space-between'} padding={8}>
      {leftContent}
      <TogglePanelButton />
    </Flexbox>
  );
});

export default BackNav;
