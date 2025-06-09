import React, { useState } from 'react';
import { supabase } from '~/utils/supabase';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      navigate('/'); // Redirect to home on successful login
    }
  };

  return (
    <main className='flex flex-col items-center justify-center min-h-screen'>
      <form
        onSubmit={handleLogin}
        className='bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-sm'
      >
        <h1 className='text-2xl font-bold mb-4 text-center'>Login</h1>
        {error && <div className='mb-4 text-red-600 text-center'>{error}</div>}
        <div className='mb-4'>
          <label className='block text-gray-700 text-sm font-bold mb-2'>
            Email
          </label>
          <input
            type='email'
            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className='mb-6'>
          <label className='block text-gray-700 text-sm font-bold mb-2'>
            Password
          </label>
          <input
            type='password'
            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type='submit'
          className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full'
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </main>
  );
};

export default Auth;
