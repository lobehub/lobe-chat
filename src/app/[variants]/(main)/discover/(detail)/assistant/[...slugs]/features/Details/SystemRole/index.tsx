import { Block, Icon, Tag } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { MessageCircleHeartIcon, MessageCircleQuestionIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import TokenTag from '../../../../../../(list)/assistant/features/List/TokenTag';
import Title from '../../../../../../features/Title';
import MarkdownRender from '../../../../../features/MakedownRender';
import { useDetailContext } from '../../DetailProvider';
import TagList from './TagList';

const Overview = memo(() => {
  const { t } = useTranslation('discover');
  const { tokenUsage, tags = [], config } = useDetailContext();
  const theme = useTheme();
  return (
    <Flexbox gap={16}>
      <Title tag={tokenUsage && <TokenTag tokenUsage={tokenUsage} />}>
        {t('assistants.details.systemRole.title')}
      </Title>
      <Block gap={16} padding={16} variant={'outlined'}>
        {<MarkdownRender>{config?.systemRole.trimEnd()}</MarkdownRender>}
        <TagList tags={tags} />
      </Block>
      <Title>{t('assistants.details.systemRole.openingMessage')}</Title>
      <Block align={'flex-start'} gap={12} horizontal padding={16} variant={'outlined'}>
        <Icon
          color={theme.colorError}
          icon={MessageCircleHeartIcon}
          size={20}
          style={{
            marginTop: 4,
          }}
        />
        <MarkdownRender>{config?.openingMessage?.trimEnd()}</MarkdownRender>
      </Block>
      <Title tag={<Tag>{config?.openingQuestions?.length}</Tag>}>
        {t('assistants.details.systemRole.openingQuestions')}
      </Title>
      <Flexbox gap={8}>
        {config?.openingQuestions?.map((item, key) => (
          <Block gap={12} horizontal key={key} padding={16} variant={'outlined'}>
            <Icon color={theme.colorWarning} icon={MessageCircleQuestionIcon} size={20} />
            <MarkdownRender>{item}</MarkdownRender>
          </Block>
        ))}
      </Flexbox>
    </Flexbox>
  );
});

export default Overview;
