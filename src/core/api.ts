// Backend address. Defaults to "same host as the page, port 8000" so the app works from
// any device on the home network (phone, laptop) without configuration.
// Override with VITE_API_BASE in .env.local if the backend lives elsewhere.
export const API_BASE: string =
  import.meta.env.VITE_API_BASE ?? `http://${window.location.hostname}:8000`;
