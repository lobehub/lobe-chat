import { Button, Dropdown, Tooltip } from '@lobehub/ui';
import { App, Space } from 'antd';
import { css, cx } from 'antd-style';
import { CopyIcon, DownloadIcon } from 'lucide-react';
import { domToPng } from 'modern-screenshot';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { BRANDING_NAME } from '@/const/branding';
import { useChatStore } from '@/store/chat';
import { chatPortalSelectors } from '@/store/chat/selectors';
import { copyImageToClipboard } from '@/utils/clipboard';

const svgContainer = css`
  width: 100%;
  height: 100%;

  > svg {
    width: 100%;
    height: 100%;
  }
`;

const actions = css`
  position: absolute;
  inset-block-end: 8px;
  inset-inline-end: 8px;
`;

const DOM_ID = 'artfact-svg';
interface SVGRendererProps {
  content: string;
}

const SVGRenderer = ({ content }: SVGRendererProps) => {
  const { t } = useTranslation('portal');
  const { message } = App.useApp();

  const generatePng = async () => {
    return domToPng(document.querySelector(`#${DOM_ID}`) as HTMLDivElement, {
      features: {
        // 不启用移除控制符，否则会导致 safari emoji 报错
        removeControlCharacter: false,
      },
      scale: 2,
    });
  };

  const downloadImage = async (type: string) => {
    let dataUrl = '';
    if (type === 'png') dataUrl = await generatePng();
    else if (type === 'svg') {
      const blob = new Blob([content], { type: 'image/svg+xml' });

      dataUrl = URL.createObjectURL(blob);
    }

    const title = chatPortalSelectors.artifactTitle(useChatStore.getState());

    const link = document.createElement('a');
    link.download = `${BRANDING_NAME}_${title}.${type}`;
    link.href = dataUrl;
    link.click();
    link.remove();
  };

  return (
    <Flexbox
      align={'center'}
      className="svg-renderer"
      height={'100%'}
      style={{ position: 'relative' }}
    >
      <Center
        className={cx(svgContainer)}
        dangerouslySetInnerHTML={{ __html: content }}
        id={DOM_ID}
      />
      <Flexbox className={cx(actions)}>
        <Space.Compact>
          <Dropdown
            menu={{
              items: [
                { key: 'png', label: t('artifacts.svg.download.png') },
                { key: 'svg', label: t('artifacts.svg.download.svg') },
              ],
              onClick: ({ key }) => {
                downloadImage(key);
              },
            }}
          >
            <Button icon={DownloadIcon} />
          </Dropdown>
          <Tooltip title={t('artifacts.svg.copyAsImage')}>
            <Button
              icon={CopyIcon}
              onClick={async () => {
                const dataUrl = await generatePng();
                try {
                  await copyImageToClipboard(dataUrl);
                  message.success(t('artifacts.svg.copySuccess'));
                } catch (e) {
                  message.error(t('artifacts.svg.copyFail', { error: e }));
                }
              }}
            />
          </Tooltip>
        </Space.Compact>
      </Flexbox>
    </Flexbox>
  );
};

export default SVGRenderer;
