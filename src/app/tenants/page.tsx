import React from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const TenantsPage: React.FC = () => {
  const { data: tenants, error } = useSWR('/api/tenants', fetcher);

  return (
    <div style={{ margin: '0 auto', maxWidth: 1200, padding: 24 }}>
      <h1>Tenant Management</h1>
      <button type="button">Create New Tenant</button>
      {error && <div style={{ color: 'red' }}>Failed to load tenants</div>}
      {!tenants ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {tenants.map((tenant: any) => (
            <li key={tenant.id}>{tenant.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TenantsPage;
