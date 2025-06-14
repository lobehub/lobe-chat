'use client';

import { ActionIcon, DatePicker, Input, TextArea } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import { Check, Edit, X } from 'lucide-react';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

// 内容类型定义
export type ContentType = 'text' | 'textarea' | 'date';

// 组件Props接口定义
export interface EditableCellProps {
  /** 是否禁用编辑 */
  disabled?: boolean;
  /** 提交回调函数 */
  onSubmit: (value: string) => void;
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
  dateDisplay: css`
    color: ${token.colorText};
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

    // 编辑状态管理
    const [isEditing, setIsEditing] = useState(false);
    // 临时编辑值状态
    const [editValue, setEditValue] = useState(value);
    // 日期选择器弹出状态
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    // 用于Input和TextArea的ref
    const inputRef = useRef<any>(null);

    // 当外部value变化时更新内部编辑值
    useEffect(() => {
      setEditValue(value);
    }, [value]);

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
      setEditValue(value);

      // 对于日期类型，显示日期选择器
      if (type === 'date') {
        setDatePickerOpen(true);
      } else {
        // 对于文本类型，聚焦输入框
        setTimeout(() => {
          inputRef.current?.focus?.();
        }, 100);
      }
    }, [disabled, value, type]);

    // 提交编辑
    const handleSubmit = useCallback(() => {
      const finalValue =
        type === 'date' && editValue
          ? dayjs(editValue).isValid()
            ? dayjs(editValue).format('YYYY-MM-DD')
            : editValue
          : editValue;

      onSubmit(finalValue);
      setIsEditing(false);
      setDatePickerOpen(false);
    }, [editValue, onSubmit, type]);

    // 取消编辑
    const handleCancel = useCallback(() => {
      setEditValue(value);
      setIsEditing(false);
      setDatePickerOpen(false);
    }, [value]);

    // 键盘事件处理
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && type !== 'textarea') {
          e.preventDefault();
          handleSubmit();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          handleCancel();
        }
      },
      [handleSubmit, handleCancel, type],
    );

    // 日期选择处理
    const handleDateChange = useCallback((date: any) => {
      if (date) {
        const dateStr = dayjs(date).format('YYYY-MM-DD');
        setEditValue(dateStr);
      }
    }, []);

    // 渲染编辑模式
    const renderEditMode = useCallback(() => {
      switch (type) {
        case 'text': {
          return (
            <div className={styles.inputWrapper}>
              <Input
                autoFocus
                onBlur={handleSubmit}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                ref={inputRef}
                value={editValue}
              />
            </div>
          );
        }

        case 'textarea': {
          return (
            <div className={styles.textareaWrapper}>
              <TextArea
                autoFocus
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                ref={inputRef}
                rows={3}
                value={editValue}
              />
            </div>
          );
        }

        case 'date': {
          const dateValue = editValue && dayjs(editValue).isValid() ? dayjs(editValue) : null;
          return (
            <DatePicker
              onChange={handleDateChange}
              onOpenChange={(open) => {
                if (!open) {
                  handleSubmit();
                }
              }}
              open={true}
              placeholder={placeholder}
              value={dateValue}
            />
          );
        }

        default: {
          return null;
        }
      }
    }, [
      type,
      editValue,
      handleKeyDown,
      placeholder,
      handleSubmit,
      datePickerOpen,
      formatDisplayValue,
      styles,
    ]);

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
        {!disabled && (
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
