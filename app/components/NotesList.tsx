import React from 'react';
import NoteCard from './NoteCard';

interface Collection {
  id: string;
  name: string;
}

interface Note {
  id: string;
  content: string;
  hidden_content: string;
}

interface NotesListProps {
  notes: Note[];
  fetchingNotes: boolean;
  editingNoteId: string | null;
  editingContent: string;
  editingHiddenContent: string;
  handleEdit: (noteId: string, content: string, hiddenContent: string) => void;
  handleInputChange: (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    noteId: string,
    field: 'content' | 'hidden_content'
  ) => void;
  getColor: (idx: number) => string;
  onDelete: (noteId: string) => void;
  collections: Collection[];
  onAddToCollection: (noteId: string, collectionId: string) => void;
}

export default function NotesList({
  notes,
  fetchingNotes,
  editingNoteId,
  editingContent,
  editingHiddenContent,
  handleEdit,
  handleInputChange,
  getColor,
  onDelete,
  collections,
  onAddToCollection,
}: NotesListProps) {
  return (
    <div className='mt-8 max-w-2xl mx-auto'>
      <h2 className='text-2xl font-bold mb-4 text-blue-700 text-center'>
        Your Notes
      </h2>
      {fetchingNotes ? (
        <div className='text-center text-blue-500'>Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className='text-gray-400 text-center'>No notes yet.</div>
      ) : (
        <ul className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
          {notes.map((note, idx) => (
            <NoteCard
              key={note.id}
              id={note.id}
              content={note.content}
              hidden_content={note.hidden_content}
              isEditing={editingNoteId === note.id}
              editingContent={editingContent}
              editingHiddenContent={editingHiddenContent}
              onEdit={handleEdit}
              onInputChange={handleInputChange}
              bgColor={getColor(idx)}
              onDelete={onDelete}
              collections={collections}
              onAddToCollection={onAddToCollection}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
