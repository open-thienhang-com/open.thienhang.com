/**
 * Runtime feature flags resolved per-request from (in priority order):
 * 1. URL query `?flag.<name>=true|false`
 * 2. localStorage key `flag.<name>` = 'true' | 'false'
 * 3. Compile-time DEFAULT_FLAGS below
 *
 * Toggle in the browser console for quick testing:
 *   localStorage.setItem('flag.cmcWorkspaceV2', 'true'); location.reload();
 */

export interface FeatureFlags {
  cmcWorkspaceV2: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  cmcWorkspaceV2: false,
};

export function getFeatureFlag<K extends keyof FeatureFlags>(name: K): FeatureFlags[K] {
  try {
    if (typeof window !== 'undefined') {
      const url = new URLSearchParams(window.location.search).get(`flag.${name}`);
      if (url === 'true') return true as FeatureFlags[K];
      if (url === 'false') return false as FeatureFlags[K];

      const ls = localStorage.getItem(`flag.${name}`);
      if (ls === 'true') return true as FeatureFlags[K];
      if (ls === 'false') return false as FeatureFlags[K];
    }
  } catch {
    /* storage unavailable */
  }
  return DEFAULT_FLAGS[name];
}

export function setFeatureFlag<K extends keyof FeatureFlags>(name: K, value: FeatureFlags[K]): void {
  try {
    localStorage.setItem(`flag.${name}`, String(value));
  } catch {
    /* storage unavailable */
  }
}
