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
    <div className='relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-xl'>
      {/* Modern glassmorphism overlay */}
      <div className='absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none rounded-2xl' />

      <form onSubmit={handleSubmit} className='relative z-10'>
        <textarea
          className='w-full p-6 bg-transparent resize-none focus:outline-none text-gray-800 placeholder-gray-400 font-medium leading-relaxed text-lg'
          placeholder="What's on your mind? ✨"
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          required
          rows={3}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${target.scrollHeight}px`;
          }}
        />

        {/* Modern floating action button */}
        <div className='flex items-center justify-between p-6 pt-0'>
          <div className='flex items-center gap-3'>
            {error && (
              <div className='flex items-center gap-2 text-red-500 text-sm font-medium'>
                <svg
                  className='w-4 h-4'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                    clipRule='evenodd'
                  />
                </svg>
                {error}
              </div>
            )}
            {success && (
              <div className='flex items-center gap-2 text-emerald-500 text-sm font-medium'>
                <svg
                  className='w-4 h-4'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                    clipRule='evenodd'
                  />
                </svg>
                Note created!
              </div>
            )}
          </div>

          <button
            type='submit'
            disabled={loading || !noteContent.trim()}
            className='group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95'
          >
            {/* Button shine effect */}
            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700' />

            <span className='relative flex items-center gap-2'>
              {loading ? (
                <>
                  <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                  Creating...
                </>
              ) : (
                <>
                  <svg
                    className='w-4 h-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 4v16m8-8H4'
                    />
                  </svg>
                  Create Note
                </>
              )}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
