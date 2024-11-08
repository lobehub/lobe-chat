import { Icon } from '@lobehub/ui';
import { Dropdown } from 'antd';
import { createStyles } from 'antd-style';
import type { ItemType } from 'antd/es/menu/interface';
import isEqual from 'fast-deep-equal';
import { ArrowRight, LibraryBig } from 'lucide-react';
import { PropsWithChildren, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import FileIcon from '@/components/FileIcon';
import RepoIcon from '@/components/RepoIcon';
import { AssignKnowledgeBaseModal } from '@/features/KnowledgeBaseModal';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';

import ListItem from './ListItem';

const useStyles = createStyles(({ css, prefixCls }) => ({
  knowledgeBase: css``,
  menu: css`
    &.${prefixCls}-dropdown-menu {
      padding-block: 8px;
    }

    .${prefixCls}-dropdown-menu-item-group-list .${prefixCls}-dropdown-menu-item {
      padding: 0;
      padding-inline-start: 8px;
      border-radius: 4px;
    }
  `,
}));

const DropdownMenu = memo<PropsWithChildren>(({ children }) => {
  const { t } = useTranslation('chat');

  const { styles } = useStyles();
  const [open, setOpen] = useState(false);
  const files = useAgentStore(agentSelectors.currentAgentFiles, isEqual);
  const knowledgeBases = useAgentStore(agentSelectors.currentAgentKnowledgeBases, isEqual);

  const [toggleFile, toggleKnowledgeBase] = useAgentStore((s) => [
    s.toggleFile,
    s.toggleKnowledgeBase,
  ]);

  const items: ItemType[] = [
    // {
    //   children: [
    //     {
    //       icon: <RepoIcon />,
    //       key: 'allFiles',
    //       label: <KnowledgeBaseItem id={'all'} label={t('knowledgeBase.allFiles')} />,
    //     },
    //     {
    //       icon: <RepoIcon />,
    //       key: 'allRepos',
    //       label: <KnowledgeBaseItem id={'all'} label={t('knowledgeBase.allKnowledgeBases')} />,
    //     },
    //   ],
    //   key: 'all',
    //   label: (
    //     <Flexbox horizontal justify={'space-between'}>
    //       {t('knowledgeBase.all')}
    //       {/*<Link href={'/files'}>{t('knowledgeBase.more')}</Link>*/}
    //     </Flexbox>
    //   ),
    //   type: 'group',
    // },
    {
      children: [
        // first the files
        ...files.map((item) => ({
          icon: <FileIcon fileName={item.name} fileType={item.type} size={20} />,
          key: item.id,
          label: (
            <ListItem
              enabled={item.enabled}
              id={item.id}
              label={item.name}
              onUpdate={async (id, enabled) => {
                await toggleFile(id, enabled);
              }}
            />
          ),
        })),

        // then the knowledge bases
        ...knowledgeBases.map((item) => ({
          icon: <RepoIcon />,
          key: item.id,
          label: (
            <ListItem
              enabled={item.enabled}
              id={item.id}
              label={item.name}
              onUpdate={async (id, enabled) => {
                await toggleKnowledgeBase(id, enabled);
              }}
            />
          ),
        })),
        {
          icon: (
            <Icon
              icon={LibraryBig}
              size={{ fontSize: 16 }}
              style={{ marginInlineEnd: 0, paddingInlineStart: 4 }}
            />
          ),
          key: 'knowledge-base-store',
          label: (
            <Flexbox gap={40} horizontal justify={'space-between'} padding={'8px 12px'}>
              {t('knowledgeBase.viewMore')} <Icon icon={ArrowRight} />
            </Flexbox>
          ),
          onClick: (e) => {
            e.domEvent.stopPropagation();
            setOpen(true);
          },
        },
      ],
      className: styles.knowledgeBase,
      key: 'relativeFilesOrKnowledgeBases',
      label: (
        <Flexbox horizontal justify={'space-between'}>
          {t('knowledgeBase.relativeFilesOrKnowledgeBases')}
          {/*<Link href={'/files'}>{t('knowledgeBase.more')}</Link>*/}
        </Flexbox>
      ),
      type: 'group',
    },
  ];

  return (
    <>
      <Dropdown
        arrow={false}
        menu={{
          className: styles.menu,
          items,
          onClick: (e) => {
            e.domEvent.preventDefault();
          },
          style: {
            maxHeight: 500,
            overflowY: 'scroll',
          },
        }}
        placement={'top'}
        trigger={['click']}
      >
        {children}
      </Dropdown>
      <AssignKnowledgeBaseModal open={open} setOpen={setOpen} />
    </>
  );
});

export default DropdownMenu;
