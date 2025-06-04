'use client';

import { Pagination as Page } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';

import { useQuery } from '@/hooks/useQuery';
import { useQueryRoute } from '@/hooks/useQueryRoute';

const useStyles = createStyles(({ css, token, prefixCls }) => {
  return {
    page: css`
      .${prefixCls}-pagination-item-active {
        border-color: ${token.colorFillSecondary};
        background: ${token.colorFillSecondary};

        &:hover {
          border-color: ${token.colorFill};
          background: ${token.colorFill};
        }
      }
    `,
  };
});

interface PaginationProps {
  currentPage: number;
  pageSize: number;
  total: number;
}

const Pagination = memo<PaginationProps>(({ currentPage, total, pageSize }) => {
  const { styles } = useStyles();
  const { page } = useQuery();
  const router = useQueryRoute();

  const handlePageChange = (newPage: number) => {
    router.push('/mcp', {
      query: {
        page: String(newPage),
      },
    });
  };

  return (
    <Page
      className={styles.page}
      current={page ? Number(page) : currentPage}
      onChange={handlePageChange}
      pageSize={pageSize}
      showSizeChanger={false}
      style={{
        alignSelf: 'flex-end',
      }}
      total={total}
    />
  );
});

export default Pagination;
