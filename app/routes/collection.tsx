import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '~/utils/supabase';
import NoteCard from '~/components/NoteCard';
import { fetchNotesForCollection } from '~/supabase/collectionsApi';

interface Note {
  id: string;
  content: string;
  hidden_content: string;
}

interface Collection {
  id: string;
  name: string;
}

export default function CollectionView() {
  const { id } = useParams<{ id: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // For NoteCard editing state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [editingHiddenContent, setEditingHiddenContent] = useState('');

  useEffect(() => {
    const fetchCollection = async () => {
      setLoading(true);
      // Fetch collection info
      const { data: colData } = await supabase
        .from('collections')
        .select('id, name')
        .eq('id', id)
        .single();
      setCollection(colData);

      // Fetch notes for this collection (many-to-many)
      const { data } = await fetchNotesForCollection(id as string);
      const notesArr = (data || [])
        .map((row: any) => row.notes)
        .filter((note: Note | null) => !!note) as Note[];
      setNotes(notesArr);
      setLoading(false);
    };
    if (id) fetchCollection();
  }, [id]);

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

  // NoteCard handlers (read-only, no autosave here, but you can add if needed)
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

  return (
    <div className='max-w-2xl mx-auto py-10'>
      <div className='mb-6 flex items-center gap-4'>
        <Link to='/collections' className='text-blue-600 hover:underline'>
          ← Back to Collections
        </Link>
        {collection && (
          <h1 className='text-2xl font-bold'>{collection.name}</h1>
        )}
      </div>
      {loading ? (
        <div className='text-center text-blue-500'>Loading...</div>
      ) : notes.length === 0 ? (
        <div className='text-gray-400 text-center'>
          No notes in this collection.
        </div>
      ) : (
        <ul className='space-y-4'>
          {notes.map((note, idx) => (
            <li key={note.id}>
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
