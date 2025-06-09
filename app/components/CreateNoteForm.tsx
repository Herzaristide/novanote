import React, { useState } from 'react';

interface CreateNoteFormProps {
  onCreate: (content: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export default function CreateNoteForm({
  onCreate,
  loading,
  error,
  success,
}: CreateNoteFormProps) {
  const [noteContent, setNoteContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreate(noteContent);
    setNoteContent('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='flex flex-col gap-2 max-w-md mx-auto bg-white/80 rounded-xl shadow-lg p-6 mb-8 border-2 border-blue-200'
    >
      <h1 className="text-3xl font-extrabold text-blue-700 mb-2 text-center drop-shadow">NovaNote</h1>
      <textarea
        className='border-2 border-blue-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition'
        placeholder='Write your new note here...'
        value={noteContent}
        onChange={(e) => setNoteContent(e.target.value)}
        required
        rows={3}
      />
      <button
        type='submit'
        className='bg-gradient-to-r from-pink-400 to-blue-500 text-white px-4 py-2 rounded-lg font-bold shadow hover:from-pink-500 hover:to-blue-600 transition'
        disabled={loading}
      >
        {loading ? 'Creating...' : 'Create Note'}
      </button>
      {error && <div className='text-red-600 text-center'>{error}</div>}
      {success && <div className='text-green-600 text-center'>Note created!</div>}
    </form>
  );
}