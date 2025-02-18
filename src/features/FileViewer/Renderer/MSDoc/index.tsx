import { DocRenderer } from '@cyntler/react-doc-viewer';
import { css, cx } from 'antd-style';
import { Flexbox } from 'react-layout-kit';

const container = css`
  position: relative;
  overflow: hidden;
  border-radius: 4px;
`;

const content = css`
  position: absolute;
  inset-block: -1px -1px;
  inset-inline-start: -1px;

  width: calc(100% + 2px);
  height: calc(100% + 2px);
  border: 0;
`;

const MSDocRenderer: DocRenderer = ({ mainState: { currentDocument } }) => {
  if (!currentDocument) return null;

  return (
    <Flexbox className={cx(container)} height={'100%'} id="msdoc-renderer" width={'100%'}>
      <iframe
        className={cx(content)}
        id="msdoc-iframe"
        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
          currentDocument.uri,
        )}`}
        title="msdoc-iframe"
      />
    </Flexbox>
  );
};

export default MSDocRenderer;

const MSDocFTMaps = {
  doc: ['doc', 'application/msword'],
  docx: [
    'docx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream',
  ],
  odt: ['odt', 'application/vnd.oasis.opendocument.text'],
  ppt: ['ppt', 'application/vnd.ms-powerpoint'],
  pptx: ['pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  xls: ['xls', 'application/vnd.ms-excel'],
  xlsx: ['xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
};

MSDocRenderer.fileTypes = [
  ...MSDocFTMaps.odt,
  ...MSDocFTMaps.doc,
  ...MSDocFTMaps.docx,
  ...MSDocFTMaps.xls,
  ...MSDocFTMaps.xlsx,
  ...MSDocFTMaps.ppt,
  ...MSDocFTMaps.pptx,
];
MSDocRenderer.weight = 0;
MSDocRenderer.fileLoader = ({ fileLoaderComplete }) => fileLoaderComplete();
