import React, { useEffect, useState } from 'react';
import { supabase } from '~/utils/supabase';
import { useNavigate, Link } from 'react-router-dom';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user on mount
    const session = supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/auth');
  };

  return (
    <nav className='flex items-center justify-between px-6 py-4 bg-gray-100 border-b'>
      <Link to='/' className='text-xl font-bold text-blue-700'>
        NovaNote
      </Link>
      <div className='flex items-center gap-4'>
        <Link
          to='/collections'
          className='bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded transition'
        >
          Collections
        </Link>
        <Link
          to='/flashcards'
          className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition'
        >
          FlashCard
        </Link>
        <Link
          to='/notes'
          className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition'
        >
          All Notes
        </Link>
        {user ? (
          <>
            <span className='text-gray-700'>{user.email}</span>
            <button
              onClick={handleLogout}
              className='bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded'
            >
              Logout
            </button>
          </>
        ) : (
          <Link to='/auth' className='text-blue-600 hover:underline'>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
