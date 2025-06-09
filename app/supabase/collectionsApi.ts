import { supabase } from '~/utils/supabase';

// Fetch all collections for a user
export async function fetchCollections(userId: string) {
  return supabase
    .from('collections')
    .select('id, name')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}

// Create a new collection
export async function createCollection(name: string, userId: string) {
  return supabase.from('collections').insert([{ name, user_id: userId }]);
}

// Fetch notes for a collection (many-to-many version)
export async function fetchNotesForCollection(collectionId: string) {
  return supabase
    .from('note_collections')
    .select('notes(id, content, hidden_content)')
    .eq('collection_id', collectionId);
}
