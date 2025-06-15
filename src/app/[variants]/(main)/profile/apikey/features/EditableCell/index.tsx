'use client';

import { ActionIcon, Input } from '@lobehub/ui';
import { InputRef, message } from 'antd';
import { createStyles } from 'antd-style';
import dayjs, { Dayjs } from 'dayjs';
import { Check, Edit, X } from 'lucide-react';
import React, { memo, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ApiKeyDatePicker from '../ApiKeyDatePicker';

// 内容类型定义
export type ContentType = 'text' | 'date';

// 组件Props接口定义
export interface EditableCellProps {
  /** 是否禁用编辑 */
  disabled?: boolean;
  /** 提交回调函数 */
  onSubmit: (value: string | Date | null) => void;
  /** 占位符文本 */
  placeholder?: string;
  /** 内容类型 */
  type: ContentType;
  /** 当前值 */
  value: string;
}

// 样式定义
const useStyles = createStyles(({ css, token }) => ({
  actionButtons: css`
    display: flex;
    flex-shrink: 0;
    gap: 4px;
  `,
  container: css`
    position: relative;

    display: flex;
    gap: 8px;
    align-items: center;

    min-height: 32px;

    &:hover .edit-button {
      opacity: 1;
    }
  `,
  content: css`
    min-width: 0;
    line-height: 1.5;
    color: ${token.colorText};
    word-break: break-all;
  `,
  editButton: css`
    opacity: 0;
    transition: opacity 0.2s ease;

    &.edit-button {
      opacity: 0;
    }
  `,
  editingContainer: css`
    display: flex;
    gap: 8px;
    align-items: center;
    width: 100%;
  `,
  inputWrapper: css`
    flex: 1;
  `,
  textareaWrapper: css`
    flex: 1;
  `,
}));

// 主组件实现
const EditableCell = memo<EditableCellProps>(
  ({ value, type, onSubmit, placeholder, disabled = false }) => {
    const { styles, cx } = useStyles();
    const { t } = useTranslation('auth');

    // 编辑状态管理
    const [isEditing, setIsEditing] = useState(false);

    // 用于Input的ref
    const inputRef = useRef<InputRef>(null);

    // 格式化显示值
    const formatDisplayValue = useCallback(
      (val: string) => {
        if (type === 'date' && val) {
          const date = dayjs(val);

          return date.isValid() ? date.format('YYYY-MM-DD') : val;
        }
        return val || placeholder || '';
      },
      [type, placeholder],
    );

    // 开始编辑
    const handleEdit = useCallback(() => {
      if (disabled) return;

      setIsEditing(true);
    }, [disabled, value, type]);

    // 提交编辑
    const handleSubmit = useCallback(() => {
      if (type === 'text') {
        const inputValue = inputRef.current?.input?.value;

        if (!inputValue) {
          message.warning(t('apikey.validation.required'));
          return;
        }

        onSubmit(inputValue);
      }

      setIsEditing(false);
    }, [onSubmit, type, t]);

    // 取消编辑
    const handleCancel = useCallback(() => {
      setIsEditing(false);
    }, [value]);

    // 输入框组件的键盘事件处理
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        console.log(e);
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSubmit();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          handleCancel();
        }
      },
      [handleSubmit, handleCancel, type],
    );

    // 日期选择器提交
    const handleDatePickerSubmit = (date: Dayjs | null) => {
      onSubmit(date && dayjs(date).toDate());

      setIsEditing(false);
    };

    // 渲染编辑模式
    const renderEditMode = useCallback(() => {
      switch (type) {
        case 'text': {
          return (
            <div className={styles.inputWrapper}>
              <Input
                autoFocus
                defaultValue={value}
                onBlur={handleSubmit}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                ref={inputRef}
              />
            </div>
          );
        }

        case 'date': {
          const dateValue = value && dayjs(value).isValid() ? dayjs(value) : null;

          return (
            <ApiKeyDatePicker
              defaultValue={dateValue}
              onChange={handleDatePickerSubmit}
              onOpenChange={() => {
                if (isEditing) {
                  setIsEditing(false);
                }
              }}
              open={true}
            />
          );
        }

        default: {
          return null;
        }
      }
    }, [type, handleKeyDown, placeholder, handleSubmit, formatDisplayValue, styles]);

    // 如果是编辑模式且不是日期类型，显示编辑界面
    if (isEditing && type !== 'date') {
      return (
        <div className={styles.editingContainer}>
          {renderEditMode()}
          <div className={styles.actionButtons}>
            <ActionIcon icon={Check} onClick={handleSubmit} size="small" />
            <ActionIcon icon={X} onClick={handleCancel} size="small" />
          </div>
        </div>
      );
    }

    // 显示模式
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          {type === 'date' && isEditing ? renderEditMode() : formatDisplayValue(value)}
        </div>
        {!isEditing && (
          <ActionIcon
            className={cx(styles.editButton, 'edit-button')}
            icon={Edit}
            onClick={handleEdit}
            size="small"
          />
        )}
      </div>
    );
  },
);

EditableCell.displayName = 'EditableCell';

export default EditableCell;
