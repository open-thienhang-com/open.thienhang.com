This project centralizes the API base URL in `src/app/core/config/api-config.ts`.

How it works
- Default production host: `https://api.thienhang.com` (DEFAULT_API_BASE)
- Local/test host provided: `http://0.0.0.0:8080` (API_HOSTS.local)
- Runtime selection order:
  1. If `window.__API_BASE__` is set (useful for temporary debugging in browser console), it will be used.
  2. If `localStorage.getItem('API_BASE')` exists, that value will be used.
  3. Otherwise `DEFAULT_API_BASE` is used.

How to switch to local API during development
- In the browser console before the app bootstraps (or in DevTools -> Sources -> Snippets), set:

  window.__API_BASE__ = 'http://0.0.0.0:8080';

- Or persist between reloads:

  localStorage.setItem('API_BASE', 'http://0.0.0.0:8080');

- To revert to production API:

  localStorage.removeItem('API_BASE');
  delete window.__API_BASE__;

Notes
- Built/compiled files under `docs/` still contain the older hardcoded URL; these are build artifacts and will be regenerated when you rebuild the project.
- If you prefer Angular environment files, we can switch to `src/environments/environment.ts` pattern instead; let me know and I can refactor accordingly.
