import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Global error hooks to capture runtime errors early and print more helpful info to the console.
// This helps debugging when the browser shows a blank page.
if (typeof window !== 'undefined') {
  window.addEventListener('error', (ev) => {
    // Use console.error for visibility in terminal and browser devtools
    // eslint-disable-next-line no-console
    console.error('[GLOBAL ERROR]', ev?.error || ev.message || ev);
  });

  window.addEventListener('unhandledrejection', (ev: any) => {
    // eslint-disable-next-line no-console
    console.error('[UNHANDLED PROMISE REJECTION]', ev.reason || ev);
  });

  // Small heartbeat to confirm bootstrap started
  // eslint-disable-next-line no-console
  console.log('[BOOT] Starting Angular bootstrap...');
}

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('[BOOT] Application bootstrapped successfully.');
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[BOOT ERROR]', err);
    try {
      // simple on-page overlay to make runtime errors visible when the app fails to render
      const el = document.createElement('div');
      el.id = 'runtime-error-overlay';
      el.style.position = 'fixed';
      el.style.left = '12px';
      el.style.top = '12px';
      el.style.right = '12px';
      el.style.zIndex = '2147483647';
      el.style.background = 'rgba(255,255,255,0.98)';
      el.style.border = '1px solid #e55353';
      el.style.padding = '12px';
      el.style.color = '#111827';
      el.style.fontFamily = 'monospace';
      el.style.whiteSpace = 'pre-wrap';
      el.style.maxHeight = '70vh';
      el.style.overflow = 'auto';
      el.innerText = '[BOOT ERROR] ' + (err && err.stack ? err.stack : String(err));
      document.body.appendChild(el);
    } catch (e) {
      // ignore DOM issues in non-browser env
    }
  });
