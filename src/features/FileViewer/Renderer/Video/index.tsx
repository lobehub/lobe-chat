import { DocRenderer } from '@cyntler/react-doc-viewer';
import { createStyles } from 'antd-style';
import { Center } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding: ${token.paddingSM}px;
    border-radius: ${token.borderRadiusLG}px;
    background: ${token.colorBgContainer};
  `,
  video: css`
    max-width: 100%;
    max-height: 100%;
    border-radius: ${token.borderRadius}px;

    object-fit: contain;
    box-shadow: ${token.boxShadowTertiary};

    &::-webkit-media-controls-panel {
      background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 30%) 100%);
    }

    &:focus {
      outline: 2px solid ${token.colorPrimary};
      outline-offset: 2px;
    }
  `,
}));

const VideoRenderer: DocRenderer = ({ mainState: { currentDocument } }) => {
  const { uri } = currentDocument || {};
  const { styles } = useStyles();

  return (
    <Center className={styles.container} height={'100%'} width={'100%'}>
      <video className={styles.video} controls height={'100%'} src={uri} width={'100%'} />
    </Center>
  );
};

export default VideoRenderer;

VideoRenderer.fileTypes = ['mp4', 'video/mp4', 'webm', 'video/webm', 'ogg', 'video/ogg'];
VideoRenderer.weight = 0;
