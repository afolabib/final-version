/**
 * browser.ts — Persistent Playwright browser session
 *
 * Launches Chromium headful on DISPLAY=:99 (Xvfb virtual display).
 * The browser window is visible via noVNC at /screen/ so you can watch
 * the agent navigate, click, and fill forms in real time.
 *
 * A single browser + page is shared across all tool calls to preserve
 * cookies, session state, and open tabs between steps.
 */

import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';

const DISPLAY  = process.env.DISPLAY  || ':99';
const HEADLESS = process.env.AGENT_HEADLESS === '1';  // default: headful

let _browser: Browser | null = null;
let _context: BrowserContext | null = null;
let _page:    Page | null = null;

/**
 * Returns the shared Page, launching a new browser session if needed.
 * Automatically restores after a crash.
 */
export async function getPage(): Promise<Page> {
  if (_page && !_page.isClosed()) return _page;

  // Ensure DISPLAY is set so Chromium opens on the Xvfb virtual screen
  process.env.DISPLAY = DISPLAY;

  _browser = await chromium.launch({
    headless: HEADLESS,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      '--window-size=1280,780',
      '--window-position=0,0',
      '--disable-infobars',
    ],
    env: { ...process.env, DISPLAY },
  });

  _context = await _browser.newContext({
    viewport:  { width: 1280, height: 780 },
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 '
             + '(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    // Persist session across restarts
    storageState: await loadStorageState(),
  });

  _context.on('page', (p) => { _page = p; });
  _page = await _context.newPage();

  // Save cookies/storage on page close so next session resumes where we left off
  _context.on('close', () => saveStorageState(_context!).catch(() => {}));

  return _page;
}

export async function closeBrowser(): Promise<void> {
  try {
    if (_context) await saveStorageState(_context);
    if (_browser) await _browser.close();
  } catch (_) {
    // ignore cleanup errors
  } finally {
    _browser = null;
    _context = null;
    _page    = null;
  }
}

// ── Session persistence ───────────────────────────────────────────────────────

const STATE_FILE = '/data/browser-state.json';

async function loadStorageState(): Promise<Parameters<BrowserContext['newPage']>[0] extends undefined ? undefined : Parameters<BrowserContext['addCookies']>[0] | undefined> {
  try {
    const fs = await import('fs/promises');
    const raw = await fs.readFile(STATE_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

async function saveStorageState(ctx: BrowserContext): Promise<void> {
  try {
    const fs    = await import('fs/promises');
    const state = await ctx.storageState();
    await fs.writeFile(STATE_FILE, JSON.stringify(state), 'utf8');
  } catch {
    // ignore — non-fatal
  }
}
