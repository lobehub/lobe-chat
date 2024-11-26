import { Typography } from '@lobehub/ui';
import { Flexbox } from 'react-layout-kit';

import { CustomMDX } from '@/components/mdx';
import { Locales } from '@/locales/resources';
import { ChangelogIndexItem, changelogService } from '@/services/changelog';

import Cover from './Cover';
import PublishedTime from './PublishedTime';
import ReadDetail from './ReadDetail';
import VersionTag from './VersionTag';

const Post = async ({
  id,
  versionRange,
  locale,
}: ChangelogIndexItem & { branch?: string; locale: Locales; mobile?: boolean }) => {
  const data = await changelogService.getPostById(id, { locale });

  return (
    <Flexbox gap={8}>
      <Cover alt={data.title} src={data.image} />
      <Flexbox gap={8} paddingInline={24}>
        <Typography headerMultiple={0.2} style={{ width: '100%' }}>
          <h1 id={id}>{data.rawTitle || data.title}</h1>
          <CustomMDX source={data.content} />
        </Typography>
        <Flexbox align={'center'} gap={8} horizontal justify={'space-between'} width={'100%'}>
          <VersionTag range={versionRange} />
          <PublishedTime
            date={data.date.toISOString()}
            style={{ fontSize: 12, opacity: 0.5 }}
            template={'MMMM D, YYYY'}
          />
        </Flexbox>
        <ReadDetail desc={data.description} postId={id} title={data.rawTitle || data.title} />
      </Flexbox>
    </Flexbox>
  );
};

export default Post;
