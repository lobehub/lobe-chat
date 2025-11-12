import { Button, Dropdown } from '@lobehub/ui';
import { Input, Popover, Space } from 'antd';
import { ChevronDown } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { ApprovalMode } from './index';

interface ApprovalActionsProps {
  approvalMode: ApprovalMode;
  onApprove?: (mode: ApprovalMode, remember?: boolean) => void;
  onReject?: (mode: ApprovalMode, reason?: string) => void;
}

const ApprovalActions = memo<ApprovalActionsProps>(({ approvalMode, onApprove, onReject }) => {
  const { t } = useTranslation(['chat', 'common']);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectPopoverOpen, setRejectPopoverOpen] = useState(false);

  return (
    <Flexbox gap={8} horizontal>
      <Popover
        arrow={false}
        content={
          <Flexbox gap={12} style={{ width: 400 }}>
            <Flexbox horizontal justify={'space-between'}>
              <div>{t('tool.intervention.rejectTitle')}</div>

              <Button
                onClick={() => {
                  onReject?.(approvalMode, rejectReason);
                  setRejectPopoverOpen(false);
                  setRejectReason('');
                }}
                size="small"
                type="primary"
              >
                {t('confirm', { ns: 'common' })}
              </Button>
            </Flexbox>
            <Input.TextArea
              autoFocus
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t('tool.intervention.rejectReasonPlaceholder')}
              rows={3}
              value={rejectReason}
              variant={'filled'}
            />
          </Flexbox>
        }
        onOpenChange={setRejectPopoverOpen}
        open={rejectPopoverOpen}
        placement="bottomRight"
        trigger="click"
      >
        <Button size="small" type="default">
          {t('tool.intervention.reject')}
        </Button>
      </Popover>

      {approvalMode === 'allow-list' ? (
        <Space.Compact>
          <Button onClick={() => onApprove?.(approvalMode, true)} size="small" type="primary">
            {t('tool.intervention.approveAndRemember')}
          </Button>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'once',
                  label: t('tool.intervention.approveOnce'),
                  onClick: () => onApprove?.(approvalMode, false),
                },
              ],
            }}
          >
            <Button icon={ChevronDown} size="small" type="primary" />
          </Dropdown>
        </Space.Compact>
      ) : (
        <Button onClick={() => onApprove?.(approvalMode)} size="small" type="primary">
          {t('tool.intervention.approve')}
        </Button>
      )}
    </Flexbox>
  );
});

export default ApprovalActions;
