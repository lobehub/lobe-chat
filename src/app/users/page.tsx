import React from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const UsersPage: React.FC = () => {
  const { data: users, error } = useSWR('/api/users', fetcher);

  return (
    <div style={{ margin: '0 auto', maxWidth: 1200, padding: 24 }}>
      <h1>User Directory</h1>
      {error && <div style={{ color: 'red' }}>Failed to load users</div>}
      {!users ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {users.map((user: any) => (
            <li key={user.id}>{user.name} ({user.role})</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UsersPage;
