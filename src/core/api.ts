// The backend serves this app and its API from one address (everything under /api), so the same
// build works from the laptop and from a phone on the home network. During development the
// Vite dev server forwards /api to the backend (see vite.config.ts).
// Override with VITE_API_BASE in .env.local if the backend lives somewhere else.
export const API_BASE: string = import.meta.env.VITE_API_BASE ?? "/api";
