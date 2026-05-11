import { HttpContextToken } from '@angular/common/http';

// Attach to requests that should silently fail — no redirect, no toast.
// Used for probe/optional calls (e.g. getGovernanceOverview, getGovernanceMetrics).
export const SILENT_ERROR = new HttpContextToken<boolean>(() => false);
