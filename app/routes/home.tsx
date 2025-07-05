import type { Route } from './+types/home';
import {
  fetchNotes,
  createNote,
  updateNote,
  deleteNote,
} from '~/supabase/notesApi';
import CreateNoteForm from '~/components/CreateNoteForm';
import { useEffect, useState } from 'react';
import { supabase } from '~/utils/supabase';
import NoteCard from '~/components/NoteCard';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ];
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [notes, setNotes] = useState<
    { id: string; content: string; hidden_content: string }[]
  >([]);
  const [fetchingNotes, setFetchingNotes] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [editingHiddenContent, setEditingHiddenContent] = useState('');
  const [collections, setCollections] = useState<
    { id: string; name: string }[]
  >([]);
  const [columnCount, setColumnCount] = useState(3);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());

  // Fetch notes for the current user
  useEffect(() => {
    const fetchAllNotes = async () => {
      setFetchingNotes(true);
      const user = await supabase.auth.getUser();
      const userId = user?.data?.user?.id;
      if (!userId) {
        setNotes([]);
        setFetchingNotes(false);
        return;
      }
      const { data, error } = await fetchNotes(userId);
      if (error) {
        setNotes([]);
      } else {
        setNotes(data || []);
      }
      setFetchingNotes(false);
    };
    fetchAllNotes();
  }, [success]); // refetch when a note is created

  // Fetch collections for the current user
  useEffect(() => {
    const fetchCollections = async () => {
      const user = await supabase.auth.getUser();
      const userId = user?.data?.user?.id;
      if (!userId) return setCollections([]);
      const { data } = await supabase
        .from('collections')
        .select('id, name')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      setCollections(data || []);
    };
    fetchCollections();
  }, []);

  const handleCreateNote = async (content: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const user = await supabase.auth.getUser();
    const userId = user?.data?.user?.id;

    const { error } = await createNote(content, userId);

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  };

  const handleEdit = (
    noteId: string,
    content: string,
    hiddenContent: string
  ) => {
    setEditingNoteId(noteId);
    setEditingContent(content);
    setEditingHiddenContent(hiddenContent);
  };

  const handleSelectNote = (noteId: string) => {
    setSelectedNotes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  // Autosave on input change for both fields
  const handleInputChange = async (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    noteId: string,
    field: 'content' | 'hidden_content'
  ) => {
    const newValue = e.target.value;
    if (field === 'content') {
      setEditingContent(newValue);
    } else {
      setEditingHiddenContent(newValue);
    }
    setEditingNoteId(noteId);

    await updateNote(noteId, {
      content: field === 'content' ? newValue : editingContent,
      hidden_content:
        field === 'hidden_content' ? newValue : editingHiddenContent,
    });

    setNotes((prev) =>
      prev.map((note) =>
        note.id === noteId
          ? {
              ...note,
              content: field === 'content' ? newValue : note.content,
              hidden_content:
                field === 'hidden_content' ? newValue : note.hidden_content,
            }
          : note
      )
    );
  };

  const handleDelete = async (noteId: string) => {
    await deleteNote(noteId);
    setNotes((prev) => prev.filter((note) => note.id !== noteId));
  };

  // Handler to add note to collection
  const handleAddToCollection = async (
    noteId: string,
    collectionId: string
  ) => {
    await supabase
      .from('note_collections')
      .insert([{ note_id: noteId, collection_id: collectionId }]);
    // Optionally update UI or show a toast
  };

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
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'>
      {/* Modern header with selection info */}
      {selectedNotes.size > 0 && (
        <div className='sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/50 p-4 mb-6'>
          <div className='max-w-7xl mx-auto flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center'>
                <span className='text-white text-sm font-semibold'>
                  {selectedNotes.size}
                </span>
              </div>
              <span className='text-gray-700 font-medium'>
                {selectedNotes.size} note{selectedNotes.size > 1 ? 's' : ''}{' '}
                selected
              </span>
            </div>
            <button
              onClick={() => setSelectedNotes(new Set())}
              className='px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors'
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className='max-w-7xl mx-auto p-6'>
        <div
          className='gap-6 space-y-6'
          style={{
            columnCount,
            columnGap: '24px',
          }}
        >
          {/* Modern create note form */}
          <div className='break-inside-avoid mb-6'>
            <CreateNoteForm
              onCreate={handleCreateNote}
              loading={loading}
              error={error}
              success={success}
            />
          </div>

          {/* Note cards */}
          {notes.map((note, idx) => (
            <div key={note.id} className='break-inside-avoid mb-6'>
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
                onDelete={handleDelete}
                collections={collections}
                onAddToCollection={handleAddToCollection}
                isSelected={selectedNotes.has(note.id)}
                onSelect={handleSelectNote}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
