import React, { useState } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import { Copy, Eye, Plus, X, Maximize2, Trash } from 'lucide-react';

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
  onDelete,
  collections,
  onAddToCollection,
}: NoteCardProps) {
  const [showHidden, setShowHidden] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // Handler for fullscreen toggle
  const handleFullscreen = () => {
    setIsFullscreen(true);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
  };

  return (
    <>
      <div
        className={`relative rounded-xs flex transition perspective-1000 h-fit group`}
      >
        {/* Button bar: only visible on hover/focus of card */}
        <div className='absolute top-2 right-2 flex gap-2 z-10 items-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto'>
          <div className='flex justify-center bg-gray-700 text-white rounded-xs'>
            <Plus
              className='rounded-xs transition'
              onClick={handleAddToCollection}
            />
            <select
              className=''
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
            >
              <option value=''>Collection</option>
              {collections.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>
          <Copy
            className='hover:bg-gray-300 text-gray-700 rounded-xs transition'
            onClick={handleCopy}
            type='button'
          />
          <Eye
            className='text-green-500 rounded-xs transition hover:bg-gray-300'
            onClick={() => setShowHidden((v) => !v)}
          />
          <Maximize2
            className='text-blue-500 rounded-xs transition hover:bg-gray-300 cursor-pointer'
            onClick={handleFullscreen}
          />
          <Trash
            className='text-red-500 rounded-xs transition hover:bg-gray-300'
            onClick={() => onDelete && onDelete(id)}
          />
        </div>
        {/* Content */}
        <div
          className={`relative transition-transform duration-500 ease-in-out w-full transform-3d ${
            showHidden ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front (content) */}
          <div
            className={`relative w-full h-full transition-opacity duration-500 bg-gray-300 ${
              showHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
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
                  Prism.highlight(
                    code,
                    Prism.languages.javascript,
                    'javascript'
                  )
                }
                padding={8}
                className='rounded-xs font-mono bg-[#2d2d2d] text-white'
                onFocus={() => onEdit(id, content, hidden_content)}
              />
            ) : (
              <textarea
                className='p-2 focus:outline-none focus:ring-2 focus:ring-red-400 transition font-mono resize-none w-full'
                value={isEditing ? editingContent : content}
                onFocus={() => onEdit(id, content, hidden_content)}
                onChange={(e) => onInputChange(e, id, 'content')}
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
            className={`absolute inset-0 w-full h-full transition-opacity duration-500 bg-gray-300 ${
              showHidden ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            style={{
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
              minHeight: 0,
              height: 'auto',
            }}
          >
            <textarea
              className='p-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition resize-none w-full'
              value={isEditing ? editingHiddenContent : hidden_content}
              onFocus={() => onEdit(id, content, hidden_content)}
              onChange={(e) => onInputChange(e, id, 'hidden_content')}
              rows={Math.max(
                3,
                (
                  (isEditing ? editingHiddenContent : hidden_content) || ''
                ).split('\n').length
              )}
            />
          </div>
        </div>
      </div>
      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div
          className='fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center'
          onClick={handleCloseFullscreen}
        >
          <div
            className='relative bg-white rounded-lg shadow-lg w-full max-w-3xl h-[80vh] flex flex-col p-0'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Button bar in fullscreen */}
            <div className='flex gap-2 items-center justify-end p-4 border-b border-gray-200'>
              <div className='flex justify-center bg-gray-700 text-white rounded-xs'>
                <Plus
                  className='rounded-xs transition'
                  onClick={handleAddToCollection}
                />
                <select
                  className=''
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                >
                  <option value=''>Collection</option>
                  {collections.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name}
                    </option>
                  ))}
                </select>
              </div>
              <Copy
                className='hover:bg-gray-300 text-gray-700 rounded-xs transition'
                onClick={handleCopy}
                type='button'
              />
              <Eye
                className='text-green-500 rounded-xs transition hover:bg-gray-300'
                onClick={() => setShowHidden((v) => !v)}
              />

              <button
                className='ml-2 text-gray-700 hover:text-red-500 text-xl'
                onClick={handleCloseFullscreen}
                title='Close'
              >
                <X />
              </button>
            </div>
            {/* Transition between content and hidden_content in fullscreen */}
            <div className='relative flex-1 overflow-auto p-6'>
              <div
                className={`relative transition-transform duration-500 ease-in-out w-full h-full ${
                  showHidden ? 'rotate-y-180' : ''
                }`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front (content) */}
                <div
                  className={`absolute inset-0 w-full h-full transition-opacity duration-500 bg-gray-100 rounded ${
                    showHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'
                  }`}
                  style={{
                    backfaceVisibility: 'hidden',
                  }}
                >
                  <h2 className='text-lg font-bold mb-4'>Note</h2>
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
                        Prism.highlight(
                          code,
                          Prism.languages.javascript,
                          'javascript'
                        )
                      }
                      padding={8}
                      className='rounded-xs font-mono bg-[#2d2d2d] text-white min-h-[200px]'
                      onFocus={() => onEdit(id, content, hidden_content)}
                    />
                  ) : (
                    <pre className='whitespace-pre-wrap break-words font-mono bg-gray-100 p-4 rounded h-full'>
                      {isEditing ? editingContent : content}
                    </pre>
                  )}
                </div>
                {/* Back (hidden_content) */}
                <div
                  className={`absolute inset-0 w-full h-full transition-opacity duration-500 bg-yellow-50 rounded ${
                    showHidden ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                  style={{
                    transform: 'rotateY(180deg)',
                    backfaceVisibility: 'hidden',
                  }}
                >
                  <h3 className='text-md font-semibold mb-2'>Hidden Content</h3>
                  {isCodeLike(
                    (isEditing ? editingHiddenContent : hidden_content) || ''
                  ) ? (
                    <Editor
                      value={isEditing ? editingHiddenContent : hidden_content}
                      onValueChange={(code) =>
                        onInputChange(
                          {
                            target: { value: code },
                          } as React.ChangeEvent<HTMLTextAreaElement>,
                          id,
                          'hidden_content'
                        )
                      }
                      highlight={(code) =>
                        Prism.highlight(
                          code,
                          Prism.languages.javascript,
                          'javascript'
                        )
                      }
                      padding={8}
                      className='rounded-xs font-mono bg-[#2d2d2d] text-white min-h-[200px]'
                      onFocus={() => onEdit(id, content, hidden_content)}
                    />
                  ) : (
                    <pre className='whitespace-pre-wrap break-words font-mono bg-yellow-50 p-4 rounded h-full'>
                      {isEditing ? editingHiddenContent : hidden_content}
                    </pre>
                  )}
                </div>
              </div>
              <style>{`
                .rotate-y-180 {
                  transform: rotateY(180deg);
                }
              `}</style>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
