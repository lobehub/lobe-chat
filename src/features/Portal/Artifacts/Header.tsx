import { ActionIcon, Icon } from '@lobehub/ui';
import { ConfigProvider, Segmented, Typography } from 'antd';
import { cx } from 'antd-style';
import { ArrowLeft, CodeIcon, EyeIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { chatPortalSelectors } from '@/store/chat/selectors';
import { oneLineEllipsis } from '@/styles';
import { ArtifactType } from '@/types/artifact';

const Header = () => {
  const { t } = useTranslation('portal');

  const [displayMode, artifactType, artifactTitle, isArtifactTagClosed, closeArtifact] =
    useChatStore((s) => {
      const messageId = chatPortalSelectors.artifactMessageId(s) || '';

      return [
        s.portalArtifactDisplayMode,
        chatPortalSelectors.artifactType(s),
        chatPortalSelectors.artifactTitle(s),
        chatPortalSelectors.isArtifactTagClosed(messageId)(s),
        s.closeArtifact,
      ];
    });

  // show switch only when artifact is closed and the type is not code
  const showSwitch = isArtifactTagClosed && artifactType !== ArtifactType.Code;

  return (
    <Flexbox align={'center'} flex={1} gap={12} horizontal justify={'space-between'} width={'100%'}>
      <Flexbox align={'center'} gap={4} horizontal>
        <ActionIcon icon={ArrowLeft} onClick={() => closeArtifact()} />
        <Typography.Text
          className={cx(oneLineEllipsis)}
          style={{ fontSize: 16 }}
          type={'secondary'}
        >
          {artifactTitle}
        </Typography.Text>
      </Flexbox>
      <ConfigProvider
        theme={{
          token: {
            borderRadiusSM: 16,
            borderRadiusXS: 16,
            fontSize: 12,
          },
        }}
      >
        {showSwitch && (
          <Segmented
            onChange={(value: 'code' | 'preview') => {
              useChatStore.setState({ portalArtifactDisplayMode: value });
            }}
            options={[
              {
                icon: <Icon icon={EyeIcon} />,
                label: t('artifacts.display.preview'),
                value: 'preview',
              },
              { icon: <Icon icon={CodeIcon} />, label: t('artifacts.display.code'), value: 'code' },
            ]}
            size={'small'}
            value={displayMode}
          />
        )}
      </ConfigProvider>
    </Flexbox>
  );
};

export default Header;
