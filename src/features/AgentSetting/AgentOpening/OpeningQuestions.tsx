'use client';

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { SortableList } from '@lobehub/ui';
import { Button, Empty, Input } from 'antd';
import { createStyles } from 'antd-style';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useStore } from '../store';
import { selectors } from '../store/selectors';

const useStyles = createStyles(({ css, token }) => ({
  empty: css`
    margin-block: 24px;
    margin-inline: 0;
  `,
  questionItemContainer: css`
    margin-block-end: 8px;
    padding-block: 2px;
    padding-inline: 10px 0;
    background: ${token.colorBgContainer};
  `,
  questionItemContent: css`
    flex: 1;
  `,
  questionsList: css`
    width: 100%;
    margin-block-start: 16px;
  `,
  repeatError: css`
    margin: 0;
    color: ${token.colorErrorText};
  `,
}));

interface QuestionItem {
  content: string;
  id: number;
}

const OpeningQuestions = memo(() => {
  const { t } = useTranslation('setting');
  const { styles } = useStyles();
  const [questionInput, setQuestionInput] = useState('');

  const openingQuestions = useStore(selectors.openingQuestions);
  const updateConfig = useStore((s) => s.setAgentConfig);
  const setQuestions = useCallback(
    (questions: string[]) => {
      updateConfig({ openingQuestions: questions });
    },
    [updateConfig],
  );

  const addQuestion = useCallback(() => {
    if (!questionInput.trim()) return;

    setQuestions([...openingQuestions, questionInput.trim()]);
    setQuestionInput('');
  }, [openingQuestions, questionInput, setQuestions]);

  const removeQuestion = useCallback(
    (content: string) => {
      const newQuestions = [...openingQuestions];
      const index = newQuestions.indexOf(content);
      newQuestions.splice(index, 1);
      setQuestions(newQuestions);
    },
    [openingQuestions, setQuestions],
  );

  // 处理拖拽排序后的逻辑
  const handleSortEnd = useCallback(
    (items: QuestionItem[]) => {
      setQuestions(items.map((item) => item.content));
    },
    [setQuestions],
  );

  const items: QuestionItem[] = useMemo(() => {
    return openingQuestions.map((item, index) => ({
      content: item,
      id: index,
    }));
  }, [openingQuestions]);

  const isRepeat = openingQuestions.includes(questionInput.trim());

  return (
    <Flexbox gap={8}>
      <Flexbox gap={4}>
        <Input
          addonAfter={
            <Button
              // don't allow repeat
              disabled={openingQuestions.includes(questionInput.trim())}
              icon={<PlusOutlined />}
              onClick={addQuestion}
              size="small"
              type="text"
            />
          }
          onChange={(e) => setQuestionInput(e.target.value)}
          onPressEnter={addQuestion}
          placeholder={t('settingOpening.openingQuestions.placeholder')}
          value={questionInput}
        />

        {isRepeat && (
          <p className={styles.repeatError}>{t('settingOpening.openingQuestions.repeat')}</p>
        )}
      </Flexbox>

      <div className={styles.questionsList}>
        {openingQuestions.length > 0 ? (
          <SortableList
            items={items}
            onChange={handleSortEnd}
            renderItem={(item) => (
              <SortableList.Item className={styles.questionItemContainer} id={item.id}>
                <SortableList.DragHandle />
                <div className={styles.questionItemContent}>{item.content}</div>
                <Button
                  icon={<DeleteOutlined />}
                  onClick={() => removeQuestion(item.content)}
                  type="text"
                />
              </SortableList.Item>
            )}
          />
        ) : (
          <Empty
            className={styles.empty}
            description={t('settingOpening.openingQuestions.empty')}
          />
        )}
      </div>
    </Flexbox>
  );
});

export default OpeningQuestions;
