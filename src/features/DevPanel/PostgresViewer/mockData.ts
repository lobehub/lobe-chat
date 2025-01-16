// Mock data
export const MOCK_TABLES = [
  { columns: ['id', 'name', 'email', 'created_at', 'updated_at'], name: 'users' },
  { columns: ['id', 'title', 'content', 'user_id', 'created_at', 'updated_at'], name: 'posts' },
  {
    columns: ['id', 'post_id', 'user_id', 'content', 'created_at', 'updated_at'],
    name: 'comments',
  },
];

export const MOCK_DATA = Array.from({ length: 300 })
  .fill(null)
  .map((_, index) => ({
    created_at: new Date().toISOString(),
    email: `user${index + 1}@example.com`,
    id: index + 1,
    name: `User ${index + 1}`,
    updated_at: new Date().toISOString(),
  }));
