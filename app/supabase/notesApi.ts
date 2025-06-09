import { supabase } from '~/utils/supabase';

// Fetch all notes for a user
export async function fetchNotes(userId: string) {
  return supabase
    .from('notes')
    .select('id, content, hidden_content')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}

// Create a new note
export async function createNote(content: string, userId: string) {
  return supabase.from('notes').insert([{ content, user_id: userId }]);
}

// Update a note's content
export async function updateNote(noteId: string, fields: { content: string; hidden_content: string }) {
  return supabase
    .from('notes')
    .update(fields)
    .eq('id', noteId);
}

// Delete a note
export async function deleteNote(noteId: string) {
  return supabase.from('notes').delete().eq('id', noteId);
}
