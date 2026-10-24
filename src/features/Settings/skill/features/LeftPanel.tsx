'use client';

import { Button, DropdownMenu, Flexbox, Icon, Text } from '@lobehub/ui';
import { GithubIcon } from '@lobehub/ui/icons';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { FileArchive, Grid2x2Plus, Link, Store } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CustomConnectorModal } from '@/features/Connectors';
import { createSkillStoreModal } from '@/features/SkillStore';
import { openImportFromGithubModal } from '@/features/SkillStore/SkillList/ImportFromGithubModal';
import { openImportFromUrlModal } from '@/features/SkillStore/SkillList/ImportFromUrlModal';
import { openUploadSkillModal } from '@/features/SkillStore/SkillList/UploadSkillModal';

import { type ToolDetailType } from './SkillDetail';
import SkillList, { type SkillViewMode } from './SkillList';

const styles = stylex.create({
  body: { overflowY: 'auto', flex: '1', paddingBlock: '4px', paddingInline: '8px' },
  header: {
    display: 'flex',
    flexShrink: 0,
    gap: '8px',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '42px',
    paddingInline: '16px',
    borderBlockEndWidth: '1px',
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: cssVar.colorBorderSecondary,
  },
  root: {
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    width: '300px',
    minWidth: '260px',
    borderInlineEndWidth: '1px',
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: cssVar.colorBorderSecondary,
  },
});

interface LeftPanelProps {
  onDeleteSelected: () => void;
  onSelect: (identifier: string, type: ToolDetailType) => void;
  selectedIdentifier?: string;
  viewMode: SkillViewMode;
}

const LeftPanel = memo<LeftPanelProps>(
  ({ onDeleteSelected, onSelect, selectedIdentifier, viewMode }) => {
    const { t } = useTranslation('setting');
    const [showAddConnector, setShowAddConnector] = useState(false);

    const handleOpenStore = useCallback(() => {
      createSkillStoreModal();
    }, []);

    const isConnectorView = viewMode === 'connector';

    return (
      <>
        <div {...stylex.props(styles.root)}>
          <div {...stylex.props(styles.header)}>
            <Text strong style={{ fontSize: 14 }}>
              {isConnectorView
                ? t('skillView.connectors', 'Connectors')
                : t('skillView.skills', 'Skills')}
            </Text>

            <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
              {isConnectorView ? (
                // Connector view: single action to add a custom OAuth connector.
                <Button
                  icon={Grid2x2Plus}
                  size="small"
                  title={t('connector.add.title', {
                    defaultValue: 'Add Custom Connector',
                    ns: 'tool',
                  })}
                  onClick={() => setShowAddConnector(true)}
                />
              ) : (
                // Skill view: import a skill from a URL, GitHub, or a zip upload.
                <DropdownMenu
                  nativeButton={false}
                  placement="bottomRight"
                  items={[
                    {
                      icon: <Icon icon={Link} />,
                      key: 'importUrl',
                      label: (
                        <Flexbox gap={2}>
                          <span>{t('tab.importFromUrl')}</span>
                          <Text style={{ fontSize: 12 }} type="secondary">
                            {t('tab.importFromUrl.desc')}
                          </Text>
                        </Flexbox>
                      ),
                      onClick: () => openImportFromUrlModal(),
                    },
                    {
                      icon: <Icon icon={GithubIcon} />,
                      key: 'importGithub',
                      label: (
                        <Flexbox gap={2}>
                          <span>{t('tab.importFromGithub')}</span>
                          <Text style={{ fontSize: 12 }} type="secondary">
                            {t('tab.importFromGithub.desc')}
                          </Text>
                        </Flexbox>
                      ),
                      onClick: () => openImportFromGithubModal(),
                    },
                    {
                      icon: <Icon icon={FileArchive} />,
                      key: 'uploadZip',
                      label: (
                        <Flexbox gap={2}>
                          <span>{t('tab.uploadZip')}</span>
                          <Text style={{ fontSize: 12 }} type="secondary">
                            {t('tab.uploadZip.desc')}
                          </Text>
                        </Flexbox>
                      ),
                      onClick: () => openUploadSkillModal(),
                    },
                  ]}
                >
                  <Button icon={Grid2x2Plus} size="small" />
                </DropdownMenu>
              )}
              <Button icon={<Icon icon={Store} />} size="small" onClick={handleOpenStore} />
            </div>
          </div>

          <div {...stylex.props(styles.body)}>
            <SkillList
              selectedIdentifier={selectedIdentifier}
              viewMode={viewMode}
              onDeleteSelected={onDeleteSelected}
              onSelect={onSelect}
            />
          </div>
        </div>
        <CustomConnectorModal open={showAddConnector} onClose={() => setShowAddConnector(false)} />
      </>
    );
  },
);

LeftPanel.displayName = 'SkillSettingsLeftPanel';

export default LeftPanel;
