import * as functions from 'firebase-functions';
import fetch from 'node-fetch';

/**
 * Fetches a URL and returns plain text (tags stripped).
 * Used during onboarding so Freemi can read the company's website.
 */
export const readWebsite = functions.https.onCall(async (data) => {
  const { url } = data as { url?: string };
  if (!url || !url.startsWith('http')) {
    throw new functions.https.HttpsError('invalid-argument', 'A valid URL is required');
  }

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Freemi/1.0)' },
      // @ts-ignore
      timeout: 8000,
      redirect: 'follow',
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();

    // Strip HTML tags → plain text, collapse whitespace
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .slice(0, 4000); // cap at 4k chars to keep LLM prompt sane

    return { text, url };
  } catch (err) {
    throw new functions.https.HttpsError('internal', `Could not fetch site: ${(err as Error).message}`);
  }
});
