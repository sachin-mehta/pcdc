import * as Sentry from '@sentry/browser';

// Store native browser fetch
const nativeFetch = window.fetch.bind(window) as typeof fetch;

// Intercept all fetch calls globally
(window as any).fetch = async (...args: Parameters<typeof fetch>): Promise<Response> => {
  try {
    return await nativeFetch(...args);
  } catch (err: any) {

    const msg = (err?.message || '').toLowerCase();

    // Normal Electron aborts / window closing / request cancellations → ignore
    // These are not real application bugs
    if (
      msg.includes('failed to fetch') ||
      msg.includes('networkerror') ||
      msg.includes('abort') ||
      msg.includes('cancel')
    ) {
      return Promise.reject(err); // Prevents UnhandledPromiseRejection
    }

    // Real errors → report to Sentry
    console.error('Fetch error:', err);
    Sentry.captureException(err);
    throw err;
  }
};
