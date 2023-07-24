import data from '@emoji-mart/data';
import i18n from '@emoji-mart/data/i18n/zh.json';
import Picker from '@emoji-mart/react';
import { Avatar } from '@lobehub/ui';
import { Popover } from 'antd';
import { createStyles } from 'antd-style';
import chroma from 'chroma-js';
import { memo } from 'react';
import { shallow } from 'zustand/shallow';

import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

const useStyles = createStyles(({ css, token, prefixCls }) => ({
  avatar: css`
    border-radius: 50%;
    transition: scale 400ms ${token.motionEaseOut}, box-shadow 100ms ${token.motionEaseOut};

    &:hover {
      box-shadow: 0 0 0 3px ${token.colorText};
    }

    &:active {
      scale: 0.8;
    }
  `,
  picker: css`
    em-emoji-picker {
      --rgb-accent: ${chroma(token.colorPrimary) .rgb() .join(',')};
      --shadow: none;
    }
  `,
  popover: css`
    .${prefixCls}-popover-inner {
      padding: 0;
    }
  `,
}));

const EmojiPicker = () => {
  const { styles } = useStyles();
  const [avatar, backgroundColor, updateAgentMeta] = useSessionStore(
    (s) => [
      agentSelectors.currentAgentAvatar(s),
      agentSelectors.currentAgentBackgroundColor(s),
      s.updateAgentMeta,
    ],
    shallow,
  );

  return (
    <Popover
      content={
        <div className={styles.picker}>
          <Picker
            data={data}
            i18n={i18n}
            locale={'zh'}
            onEmojiSelect={(e: any) => {
              updateAgentMeta({ avatar: e.native });
            }}
            skinTonePosition={'none'}
            theme={'auto'}
          />
        </div>
      }
      placement={'left'}
      rootClassName={styles.popover}
      trigger={'click'}
    >
      <div className={styles.avatar} style={{ width: 'fit-content' }}>
        <Avatar avatar={avatar} background={backgroundColor} size={44} />
      </div>
    </Popover>
  );
};

export default memo(EmojiPicker);
