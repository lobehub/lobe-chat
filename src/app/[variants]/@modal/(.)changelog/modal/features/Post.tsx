import { Typography } from '@lobehub/ui';
import Link from 'next/link';
import { Flexbox } from 'react-layout-kit';
import urlJoin from 'url-join';

import { CustomMDX } from '@/components/mdx';
import Image from '@/components/mdx/Image';
import { OFFICIAL_SITE } from '@/const/url';
import { Locales } from '@/locales/resources';
import { ChangelogService } from '@/server/services/changelog';
import { ChangelogIndexItem } from '@/types/changelog';

import Cover from './Cover';
import PublishedTime from './PublishedTime';
import ReadDetail from './ReadDetail';
import VersionTag from './VersionTag';

const Post = async ({
  id,
  versionRange,
  locale,
}: ChangelogIndexItem & { branch?: string; locale: Locales; mobile?: boolean }) => {
  const changelogService = new ChangelogService();
  const data = await changelogService.getPostById(id, { locale });
  const url = urlJoin(OFFICIAL_SITE, 'changelog', id);

  if (!data) return null;

  return (
    <Flexbox gap={8}>
      <Link href={url} style={{ color: 'inherit' }} target={'_blank'}>
        <Cover>
          <Image alt={data.title} src={data.image} />
        </Cover>
      </Link>
      <Flexbox gap={8} paddingInline={24}>
        <Typography headerMultiple={0.2} style={{ width: '100%' }}>
          <Link href={url} style={{ color: 'inherit' }} target={'_blank'}>
            <h1 id={id}>{data.rawTitle || data.title}</h1>
          </Link>
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
