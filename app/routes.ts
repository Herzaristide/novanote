import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('auth', 'routes/auth.tsx'),
  route('collections', 'routes/collections.tsx'),
  route('notes', 'routes/notes.tsx'),
  route('collections/:id', 'routes/collection.tsx'),
  route('flashcards', 'routes/flashcards.tsx'), // <-- Add this line
] satisfies RouteConfig;
