import { Icon, ItemType } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { ArrowRight, LibraryBig } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import FileIcon from '@/components/FileIcon';
import RepoIcon from '@/components/RepoIcon';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';

import CheckboxItem from '../components/CheckbokWithLoading';

export const useControls = ({
  setModalOpen,
  setUpdating,
}: {
  setModalOpen: (open: boolean) => void;
  setUpdating: (updating: boolean) => void;
}) => {
  const { t } = useTranslation('chat');

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
            <CheckboxItem
              checked={item.enabled}
              id={item.id}
              label={item.name}
              onUpdate={async (id, enabled) => {
                setUpdating(true);
                await toggleFile(id, enabled);
                setUpdating(false);
              }}
            />
          ),
        })),

        // then the knowledge bases
        ...knowledgeBases.map((item) => ({
          icon: <RepoIcon />,
          key: item.id,
          label: (
            <CheckboxItem
              checked={item.enabled}
              id={item.id}
              label={item.name}
              onUpdate={async (id, enabled) => {
                setUpdating(true);
                await toggleKnowledgeBase(id, enabled);
                setUpdating(false);
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
        setModalOpen(true);
      },
    },
  ];

  return items;
};
