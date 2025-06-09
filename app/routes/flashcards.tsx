import React, { useEffect, useState } from 'react';
import { supabase } from '~/utils/supabase';

interface Collection {
  id: string;
  name: string;
}

interface Note {
  id: string;
  content: string;
  hidden_content: string;
}

function Flashcard({
  note,
  onSuccess,
}: {
  note: Note;
  onSuccess: () => void;
}) {
  const [input, setInput] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setIsCorrect(false);
    setShowAnswer(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (input.trim() === (note.hidden_content || '').trim()) {
        setIsCorrect(true);
        setShowAnswer(false);
        setTimeout(() => {
          setInput('');
          setIsCorrect(false);
          onSuccess();
        }, 700);
      } else {
        setShowAnswer(true);
        setIsCorrect(false);
        setTimeout(() => {
          setInput('');
          setShowAnswer(false);
          onSuccess();
        }, 1500);
      }
    }
  };

  return (
    <div className='w-full max-w-xl mx-auto flex flex-col items-center'>
      <div
        className='relative w-full min-h-[200px] min-w-[300px] flex items-center justify-center perspective'
        style={{ perspective: 1000 }}
        title='Type the answer below'
      >
        <div
          className='w-full h-full flex items-center justify-center bg-white border rounded-xl shadow-lg text-xl font-mono p-8'
          style={{
            minHeight: 200,
            minWidth: 300,
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)',
          }}
        >
          {note.content}
        </div>
      </div>
      <input
        className={`mt-4 border rounded px-4 py-2 w-full text-lg text-center transition ${
          isCorrect
            ? 'border-green-500 bg-green-50'
            : input
            ? 'border-blue-400'
            : 'border-gray-300'
        }`}
        placeholder='Type the answer and press Enter...'
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        autoFocus
      />
      {isCorrect && (
        <div className='mt-2 text-green-600 font-semibold'>Correct!</div>
      )}
      {showAnswer && (
        <div className='mt-2 text-red-600 font-semibold'>
          Correct answer:{' '}
          <span className='bg-gray-100 px-2 py-1 rounded'>
            {note.hidden_content}
          </span>
        </div>
      )}
    </div>
  );
}

export default function FlashcardsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(false);

  useEffect(() => {
    const fetchCollections = async () => {
      setLoadingCollections(true);
      const user = await supabase.auth.getUser();
      const userId = user?.data?.user?.id;
      if (!userId) {
        setCollections([]);
        setLoadingCollections(false);
        return;
      }
      const { data } = await supabase
        .from('collections')
        .select('id, name')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      setCollections(data || []);
      setLoadingCollections(false);
    };
    fetchCollections();
  }, []);

  useEffect(() => {
    if (!selectedCollection) {
      setNotes([]);
      setCurrentIdx(0);
      return;
    }
    const fetchNotes = async () => {
      setLoadingNotes(true);
      const { data } = await supabase
        .from('note_collections')
        .select('notes(id, content, hidden_content)')
        .eq('collection_id', selectedCollection);
      const notesArr = (data || [])
        .map((row: any) => row.notes)
        .filter((note: Note | null) => !!note) as Note[];
      setNotes(notesArr);
      setCurrentIdx(0);
      setLoadingNotes(false);
    };
    fetchNotes();
  }, [selectedCollection]);

  const handleNext = () => {
    setCurrentIdx((idx) => (idx + 1) % notes.length);
  };

  return (
    <div className='max-w-xl mx-auto py-10'>
      <h1 className='text-2xl font-bold mb-6 text-center'>Flashcards</h1>
      {loadingCollections ? (
        <div className='text-center text-blue-500'>Loading collections...</div>
      ) : (
        <div className='flex flex-col items-center gap-4 mb-8'>
          <select
            className='border rounded px-3 py-2 w-full'
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
          >
            <option value=''>Choose a collection</option>
            {collections.map((col) => (
              <option key={col.id} value={col.id}>
                {col.name}
              </option>
            ))}
          </select>
        </div>
      )}
      {loadingNotes ? (
        <div className='text-center text-blue-500'>Loading notes...</div>
      ) : notes.length === 0 && selectedCollection ? (
        <div className='text-gray-400 text-center'>
          No notes in this collection.
        </div>
      ) : notes.length > 0 ? (
        <div>
          <Flashcard
            note={notes[currentIdx]}
            onSuccess={handleNext}
          />
          <div className='flex justify-center gap-4 mt-6'>
            <span className='text-gray-600 mt-2'>
              {currentIdx + 1} / {notes.length}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
