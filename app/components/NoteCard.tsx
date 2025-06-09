import React, { useState } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript'; // add more languages as needed
// import 'prismjs/themes/prism-tomorrow.css';

interface Collection {
  id: string;
  name: string;
}

interface NoteCardProps {
  id: string;
  content: string;
  hidden_content: string;
  isEditing: boolean;
  editingContent: string;
  editingHiddenContent: string;
  onEdit: (noteId: string, content: string, hiddenContent: string) => void;
  onInputChange: (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    noteId: string,
    field: 'content' | 'hidden_content'
  ) => void;
  bgColor: string;
  onDelete?: (noteId: string) => void;
  collections: Collection[];
  onAddToCollection: (noteId: string, collectionId: string) => void;
}

function isCodeLike(text: string) {
  if (!text) return false;
  const lines = text.split('\n');
  if (lines.length < 2) return false;
  const codeLines = lines.filter(
    (l) =>
      /^\s{2,}/.test(l) ||
      /^[\{\}\[\]\(\)\.;]/.test(l.trim()) ||
      l.trim().includes('=>') ||
      l.trim().includes('function') ||
      l.trim().includes('const ') ||
      l.trim().includes('let ') ||
      l.trim().includes('var ') ||
      l.trim().includes('class ')
  );
  return codeLines.length > lines.length / 2;
}

export default function NoteCard({
  id,
  content,
  hidden_content,
  isEditing,
  editingContent,
  editingHiddenContent,
  onEdit,
  onInputChange,
  bgColor,
  onDelete,
  collections,
  onAddToCollection,
}: NoteCardProps) {
  const [showHidden, setShowHidden] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [copied, setCopied] = useState(false);

  const handleAddToCollection = () => {
    if (selectedCollection) {
      onAddToCollection(id, selectedCollection);
      setSelectedCollection('');
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(isEditing ? editingContent : content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <li
      className={`relative border-2 border-blue-200 rounded-xl shadow-md p-4 flex flex-col gap-2 transition hover:scale-105 ${bgColor}`}
      style={{
        perspective: 1000,
        minHeight: 0,
        height: 'auto',
      }}
    >
      {/* Copy button */}
      <button
        className='absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs shadow transition z-10'
        onClick={handleCopy}
        title='Copy content'
        type='button'
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <div
        className={`transition-transform duration-500 ease-in-out w-full h-full ${
          showHidden ? 'rotate-y-180' : ''
        }`}
        style={{
          transformStyle: 'preserve-3d',
          position: 'relative',
          minHeight: 0,
          height: 'auto',
        }}
      >
        {/* Front (content) */}
        <div
          className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
            showHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          style={{
            backfaceVisibility: 'hidden',
            minHeight: 0,
            height: 'auto',
            position: 'relative',
          }}
        >
          {isCodeLike((isEditing ? editingContent : content) || '') ? (
            <Editor
              value={isEditing ? editingContent : content}
              onValueChange={(code) =>
                onInputChange(
                  {
                    target: { value: code },
                  } as React.ChangeEvent<HTMLTextAreaElement>,
                  id,
                  'content'
                )
              }
              highlight={(code) =>
                Prism.highlight(code, Prism.languages.javascript, 'javascript')
              }
              padding={10}
              style={{
                fontFamily: 'monospace',
                fontSize: 16,
                background: '#2d2d2d',
                color: '#fff',
                borderRadius: 8,
                minHeight: 40,
              }}
              onFocus={() => onEdit(id, content, hidden_content)}
            />
          ) : (
            <textarea
              className='border-2 border-blue-300 rounded-lg p-2 bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-lg font-medium resize-none w-full'
              value={isEditing ? editingContent : content}
              onFocus={() => onEdit(id, content, hidden_content)}
              onChange={(e) => onInputChange(e, id, 'content')}
              style={{
                minHeight: 40,
                height: 'auto',
                overflow: 'hidden',
              }}
              rows={Math.max(
                3,
                ((isEditing ? editingContent : content) || '').split('\n')
                  .length
              )}
            />
          )}
        </div>
        {/* Back (hidden_content) */}
        <div
          className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
            showHidden ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={{
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            minHeight: 0,
            height: 'auto',
            position: 'relative',
          }}
        >
          <textarea
            className='border-2 border-yellow-300 rounded-lg p-2 bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition text-lg font-medium resize-none w-full'
            value={isEditing ? editingHiddenContent : hidden_content}
            onFocus={() => onEdit(id, content, hidden_content)}
            onChange={(e) => onInputChange(e, id, 'hidden_content')}
            style={{
              minHeight: 40,
              height: 'auto',
              overflow: 'hidden',
            }}
            rows={Math.max(
              3,
              ((isEditing ? editingHiddenContent : hidden_content) || '').split(
                '\n'
              ).length
            )}
          />
        </div>
      </div>
      <div className='flex justify-between mt-2 items-center gap-2 flex-wrap'>
        <div className='flex gap-2 items-center'>
          <select
            className='border rounded px-2 py-1 text-sm'
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
          >
            <option value=''>Add to collection</option>
            {collections.map((col) => (
              <option key={col.id} value={col.id}>
                {col.name}
              </option>
            ))}
          </select>
          <button
            className='bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm transition'
            onClick={handleAddToCollection}
            disabled={!selectedCollection}
          >
            Add
          </button>
        </div>
        <div className='flex gap-2'>
          <button
            className='bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition'
            onClick={() => setShowHidden((v) => !v)}
          >
            {showHidden ? 'Show content' : 'Show hidden content'}
          </button>
          <button
            className='bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition'
            onClick={() => onDelete && onDelete(id)}
          >
            Delete
          </button>
        </div>
      </div>
      <style>{`
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </li>
  );
}
