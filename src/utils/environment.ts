/**
 * Whether to expose developer/debug affordances (the /debug page and its nav button).
 *
 * True on the local dev server, and on Cloudflare Pages preview/staging deploys where the
 * `VITE_SHOW_DEBUG` environment variable is set to `true` for the Preview environment. False in
 * production, where that variable is left unset.
 */
export const SHOW_DEBUG: boolean =
  import.meta.env.DEV || import.meta.env.VITE_SHOW_DEBUG === 'true';
