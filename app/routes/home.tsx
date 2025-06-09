import type { Route } from './+types/home';
import {
  fetchNotes,
  createNote,
  updateNote,
  deleteNote,
} from '~/supabase/notesApi';
import NotesList from '~/components/NotesList';
import CreateNoteForm from '~/components/CreateNoteForm';
import { useEffect, useState } from 'react';
import { supabase } from '~/utils/supabase';

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
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50 py-10'>
      <CreateNoteForm
        onCreate={handleCreateNote}
        loading={loading}
        error={error}
        success={success}
      />

      <NotesList
        notes={notes}
        fetchingNotes={fetchingNotes}
        editingNoteId={editingNoteId}
        editingContent={editingContent}
        editingHiddenContent={editingHiddenContent}
        handleEdit={handleEdit}
        handleInputChange={handleInputChange}
        getColor={getColor}
        onDelete={handleDelete}
        collections={collections}
        onAddToCollection={handleAddToCollection}
      />
    </div>
  );
}
