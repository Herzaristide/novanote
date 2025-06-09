import React, { useEffect, useState } from 'react';
import { supabase } from '~/utils/supabase';
import {
  fetchCollections,
  createCollection,
  fetchNotesForCollection,
} from '~/supabase/collectionsApi';
import NoteCard from '~/components/NoteCard';
import { Link } from 'react-router-dom'; // Add this import at the top

interface Note {
  id: string;
  content: string;
  hidden_content: string;
}

interface Collection {
  id: string;
  name: string;
}

const Collections = () => {
  const [name, setName] = useState('');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [notesByCollection, setNotesByCollection] = useState<Record<string, Note[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For NoteCard editing state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [editingHiddenContent, setEditingHiddenContent] = useState('');

  // Fetch all collections for the current user
  useEffect(() => {
    const fetchAllCollections = async () => {
      const user = await supabase.auth.getUser();
      const userId = user?.data?.user?.id;
      if (!userId) return setCollections([]);
      const { data, error } = await fetchCollections(userId);
      if (error) setCollections([]);
      else setCollections(data || []);
    };
    fetchAllCollections();
  }, [loading]);

  // Fetch notes for each collection (many-to-many)
  useEffect(() => {
    const fetchNotesForAllCollections = async () => {
      if (collections.length === 0) {
        setNotesByCollection({});
        return;
      }
      const notesMap: Record<string, Note[]> = {};
      for (const col of collections) {
        const { data } = await fetchNotesForCollection(col.id);
        notesMap[col.id] = (data || [])
          .map((row: any) => row.notes)
          .filter((note: Note | null) => !!note);
      }
      setNotesByCollection(notesMap);
    };
    fetchNotesForAllCollections();
  }, [collections]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const user = await supabase.auth.getUser();
    const userId = user?.data?.user?.id;
    if (!userId) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }
    const { error } = await createCollection(name, userId);
    setLoading(false);
    if (error) setError(error.message);
    else setName('');
  };

  // Remove note from collection handler
  const handleRemoveFromCollection = async (noteId: string, collectionId: string) => {
    await supabase
      .from('note_collections')
      .delete()
      .eq('note_id', noteId)
      .eq('collection_id', collectionId);

    setNotesByCollection((prev) => ({
      ...prev,
      [collectionId]: (prev[collectionId] || []).filter((note) => note.id !== noteId),
    }));
  };

  // NoteCard handlers (read-only, no autosave here, but you can add if needed)
  const handleEdit = (noteId: string, content: string, hiddenContent: string) => {
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
    // You can add autosave logic here if you want to update notes from collections view
  };

  // Dummy props for NoteCard collections/add-to-collection (not used here)
  const dummyCollections: Collection[] = [];
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
    <div className='max-w-xl mx-auto py-10'>
      <form onSubmit={handleCreate} className='flex gap-2 mb-6'>
        <input
          className='border rounded px-3 py-2 flex-1'
          placeholder='Collection name'
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button
          type='submit'
          className='bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded'
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create'}
        </button>
      </form>
      {error && <div className='text-red-600 mb-4'>{error}</div>}
      <h2 className='text-xl font-bold mb-2'>Your Collections</h2>
      <ul className='space-y-4'>
        {collections.map((col, colIdx) => (
          <li key={col.id} className='border rounded px-3 py-2 bg-purple-50'>
            <div className='font-semibold mb-1 flex items-center gap-2'>
              {col.name}
              <Link
                to={`/collections/${col.id}`}
                className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                title="View collection"
              >
                View
              </Link>
            </div>
            <ul className='ml-4'>
              {(notesByCollection[col.id] || []).length === 0 ? (
                <li className='text-gray-400'>No notes in this collection.</li>
              ) : (
                notesByCollection[col.id].map((note, noteIdx) => (
                  <li key={note.id} className='mb-3 flex items-center gap-2'>
                    <div className="flex-1">
                      <NoteCard
                        id={note.id}
                        content={note.content}
                        hidden_content={note.hidden_content}
                        isEditing={editingNoteId === note.id}
                        editingContent={editingContent}
                        editingHiddenContent={editingHiddenContent}
                        onEdit={handleEdit}
                        onInputChange={handleInputChange}
                        bgColor={getColor(noteIdx)}
                        onDelete={() => handleRemoveFromCollection(note.id, col.id)}
                        collections={dummyCollections}
                        onAddToCollection={dummyAddToCollection}
                      />
                    </div>
                  </li>
                ))
              )}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Collections;
