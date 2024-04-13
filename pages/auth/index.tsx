import { NextPage } from 'next';
import { useState } from 'react';
import Router from 'next/router';

const AuthPage: NextPage = () => {
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/auth?password=${encodeURIComponent(password)}`);
    if (res.ok) {
      Router.push('/');
    } else {
      alert('Invalid password');
    }
  };

  return (
    <div>
      <h1>Password Required</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default AuthPage;
