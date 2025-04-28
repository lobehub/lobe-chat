import { DropdownProps, Icon, ItemType } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { ArrowRight, LibraryBig } from 'lucide-react';
import { PropsWithChildren, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import FileIcon from '@/components/FileIcon';
import RepoIcon from '@/components/RepoIcon';
import { AssignKnowledgeBaseModal } from '@/features/KnowledgeBaseModal';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';

import ActionDropdown from '../../components/ActionDropdown';
import ListItem from './ListItem';

const DropdownMenu = memo<PropsWithChildren>(({ children }) => {
  const { t } = useTranslation('chat');

  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
      ],
      key: 'relativeFilesOrKnowledgeBases',
      label: t('knowledgeBase.relativeFilesOrKnowledgeBases'),
      type: 'group',
    },
    {
      type: 'divider',
    },
    {
      extra: <Icon icon={ArrowRight} />,
      icon: LibraryBig,
      key: 'knowledge-base-store',
      label: t('knowledgeBase.viewMore'),
      onClick: () => {
        setDropdownOpen(false);
        setOpen(true);
      },
    },
  ];

  const handleOpenChange: DropdownProps['onOpenChange'] = (nextOpen, info) => {
    if (info.source === 'trigger' || nextOpen) {
      setDropdownOpen(nextOpen);
    }
  };

  return (
    <>
      <ActionDropdown
        maxHeight={500}
        menu={{
          items,
        }}
        minWidth={240}
        onOpenChange={handleOpenChange}
        open={dropdownOpen}
      >
        {children}
      </ActionDropdown>
      <AssignKnowledgeBaseModal open={open} setOpen={setOpen} />
    </>
  );
});

export default DropdownMenu;
