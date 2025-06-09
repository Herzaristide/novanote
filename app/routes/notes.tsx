import React, { useEffect, useState } from 'react';
import { supabase } from '~/utils/supabase';
import NoteCard from '~/components/NoteCard';

interface Note {
  id: string;
  content: string;
  hidden_content: string;
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);

  // Dummy editing state for NoteCard
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [editingHiddenContent, setEditingHiddenContent] = useState('');

  useEffect(() => {
    const fetchNotes = async () => {
      const user = await supabase.auth.getUser();
      const userId = user?.data?.user?.id;
      if (!userId) return setNotes([]);
      const { data } = await supabase
        .from('notes')
        .select('id, content, hidden_content')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      setNotes(data || []);
    };
    fetchNotes();
  }, []);

  const handleEdit = (
    noteId: string,
    content: string,
    hiddenContent: string
  ) => {
    setEditingNoteId(noteId);
    setEditingContent(content);
    setEditingHiddenContent(hiddenContent);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    noteId: string,
    field: 'content' | 'hidden_content'
  ) => {
    const newValue = e.target.value;
    if (field === 'content') setEditingContent(newValue);
    else setEditingHiddenContent(newValue);
    setEditingNoteId(noteId);
  };

  // Dummy collections/add-to-collection for NoteCard
  const dummyCollections: any[] = [];
  const dummyAddToCollection = () => {};

  // Color helper
  const pastelColors = [
    'bg-pink-100',
    'bg-yellow-100',
    'bg-green-100',
    'bg-blue-100',
    'bg-purple-100',
    'bg-orange-100',
    'bg-teal-100',
  ];
  const getColor = (idx: number) => pastelColors[idx % pastelColors.length];

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50 py-10'>
      <h1 className='text-2xl font-bold mb-6 text-center'>All Notes</h1>
      <div className='max-w-4xl mx-auto'>
        <ul className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
          {notes.map((note, idx) => (
            <li
              key={note.id}
              className={`transition-all duration-300 ${
                expandedNoteId === note.id
                  ? 'fixed inset-0 z-50 bg-white flex items-center justify-center p-4'
                  : ''
              }`}
              style={
                expandedNoteId === note.id
                  ? { width: '100vw', height: '100vh', overflow: 'auto' }
                  : {}
              }
              onClick={() => setExpandedNoteId(note.id)}
            >
              <div
                className={expandedNoteId === note.id ? 'w-full max-w-3xl' : ''}
                onClick={(e) => {
                  if (expandedNoteId === note.id) e.stopPropagation();
                }}
              >
                <NoteCard
                  id={note.id}
                  content={note.content}
                  hidden_content={note.hidden_content}
                  isEditing={editingNoteId === note.id}
                  editingContent={editingContent}
                  editingHiddenContent={editingHiddenContent}
                  onEdit={handleEdit}
                  onInputChange={handleInputChange}
                  bgColor={getColor(idx)}
                  onDelete={undefined}
                  collections={dummyCollections}
                  onAddToCollection={dummyAddToCollection}
                />
                {expandedNoteId === note.id && (
                  <button
                    className='absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow'
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedNoteId(null);
                    }}
                  >
                    Close
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
