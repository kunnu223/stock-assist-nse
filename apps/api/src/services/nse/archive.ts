/**
 * NSE archive downloader with an on-disk cache.
 *
 * Sources (all public, no login):
 * - Daily bhavcopy, old format (to 2024-07-05) and UDiFF format (from 2024-07-08)
 * - PR zip per day, whose `Bc*.csv` lists corporate actions (from 2010)
 * - symbolchange.csv (renames)
 *
 * Cache layout under CACHE_DIR: bhav/YYYY/YYYYMMDD.csv.gz (EQ/BE/BZ rows, compact),
 * bc/YYYY/YYYYMMDD.csv, plus `.none` markers for days with no file.
 *
 * @module @stock-assist/api/services/nse/archive
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import path from 'path';
import { gunzipSync, gzipSync } from 'zlib';
import { unzipSync, strFromU8 } from 'fflate';
import { parseBhavcopy, toCompactCsv } from './bhavcopy';

export const CACHE_DIR = process.env.NSE_CACHE_DIR ?? path.resolve(__dirname, '../../../.cache/nse');
const HOST = 'https://nsearchives.nseindia.com';
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
/** First trading day published in the UDiFF bhavcopy format only */
export const UDIFF_START = '2024-07-08';

const parts = (iso: string) => ({ y: iso.slice(0, 4), m: iso.slice(5, 7), d: iso.slice(8, 10) });

export function bhavUrl(iso: string): string {
    const { y, m, d } = parts(iso);
    if (iso >= UDIFF_START) return `${HOST}/content/cm/BhavCopy_NSE_CM_0_0_0_${y}${m}${d}_F_0000.csv.zip`;
    const mon = MON[Number(m) - 1];
    return `${HOST}/content/historical/EQUITIES/${y}/${mon}/cm${d}${mon}${y}bhav.csv.zip`;
}

export function prUrl(iso: string): string {
    const { y, m, d } = parts(iso);
    return `${HOST}/archives/equities/bhavcopy/pr/PR${d}${m}${y.slice(2)}.zip`;
}

/** Minimum gap between request starts, shared by all callers. NSE blocks bursts with HTTP 403. */
const MIN_INTERVAL_MS = Number(process.env.NSE_MIN_INTERVAL_MS ?? 400);
let nextSlot = 0;
async function pace() {
    const now = Date.now();
    const wait = Math.max(0, nextSlot - now);
    nextSlot = Math.max(now, nextSlot) + MIN_INTERVAL_MS;
    if (wait > 0) await new Promise(r => setTimeout(r, wait));
}

/**
 * GET with pacing and retries. Returns null on 404 (no file for that day).
 * 403/429/503 mean "slow down": wait 90 s × attempt before retrying.
 */
export async function fetchBuffer(url: string, attempts = 6): Promise<Buffer | null> {
    for (let i = 1; ; i++) {
        await pace();
        let status = 0;
        try {
            const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30_000) });
            status = res.status;
            if (res.status === 404) return null;
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return Buffer.from(await res.arrayBuffer());
        } catch (err) {
            if (i >= attempts) throw new Error(`${url}: ${(err as Error).message}`);
            const throttled = status === 403 || status === 429 || status === 503;
            await new Promise(r => setTimeout(r, throttled ? 90_000 * i : 1000 * 2 ** i));
        }
    }
}

/** First file in a zip whose name matches `pattern` (default: any), as text. */
export function unzipText(buf: Buffer, pattern: RegExp = /./): string | null {
    const files = unzipSync(new Uint8Array(buf));
    const name = Object.keys(files).find(n => pattern.test(path.basename(n)));
    return name ? strFromU8(files[name]) : null;
}

const cachePath = (kind: 'bhav' | 'bc', iso: string, ext: string) =>
    path.join(CACHE_DIR, kind, iso.slice(0, 4), `${iso.replace(/-/g, '')}${ext}`);

function write(file: string, data: Buffer | string) {
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, data);
}

/** A missing file is only cached as "none" once the day is safely in the past (files publish ~6 pm). */
const settled = (iso: string) => Date.now() - Date.parse(`${iso}T00:00:00Z`) > 3 * 86_400_000;

/**
 * Compact bhavcopy CSV for a day (downloaded once), or null if NSE has none (holiday).
 */
export async function getBhavcopy(iso: string, refresh = false): Promise<string | null> {
    const file = cachePath('bhav', iso, '.csv.gz');
    if (existsSync(file) && !refresh) return gunzipSync(readFileSync(file)).toString('utf8');
    const none = cachePath('bhav', iso, '.none');
    if (existsSync(none)) return null;
    const zip = await fetchBuffer(bhavUrl(iso));
    const text = zip ? unzipText(zip, /\.csv$/i) : null;
    if (!text) {
        if (settled(iso)) write(none, '');
        return null;
    }
    const compact = toCompactCsv(parseBhavcopy(text));
    write(file, gzipSync(compact));
    return compact;
}

/** Raw `Bc` corporate-action CSV for a day, or null. */
export async function getCorporateActionsFile(iso: string): Promise<string | null> {
    const file = cachePath('bc', iso, '.csv');
    if (existsSync(file)) return readFileSync(file, 'utf8');
    const none = cachePath('bc', iso, '.none');
    if (existsSync(none)) return null;
    const zip = await fetchBuffer(prUrl(iso));
    const text = zip ? unzipText(zip, /^bc.*\.csv$/i) : null;
    if (text === null) {
        if (settled(iso)) write(none, '');
        return null;
    }
    write(file, text);
    return text;
}

/** symbolchange.csv, refreshed when older than 7 days. */
export async function getSymbolChanges(): Promise<string> {
    const file = path.join(CACHE_DIR, 'symbolchange.csv');
    const fresh = existsSync(file) && Date.now() - statSync(file).mtimeMs < 7 * 86_400_000;
    if (!fresh) {
        const buf = await fetchBuffer(`${HOST}/content/equities/symbolchange.csv`);
        if (buf) write(file, buf);
    }
    return readFileSync(file, 'latin1');
}

/** Cached days (YYYY-MM-DD) that have a bhavcopy file, sorted. */
export function cachedTradingDays(): string[] {
    return listCached('bhav', /^(\d{4})(\d{2})(\d{2})\.csv\.gz$/);
}

/** Cached days that have a `Bc` corporate-action file, sorted. */
export function cachedCorporateActionDays(): string[] {
    return listCached('bc', /^(\d{4})(\d{2})(\d{2})\.csv$/);
}

export const readCachedBhavcopy = (iso: string): string =>
    gunzipSync(readFileSync(cachePath('bhav', iso, '.csv.gz'))).toString('utf8');

export const readCachedCorporateActions = (iso: string): string =>
    readFileSync(cachePath('bc', iso, '.csv'), 'latin1');

export function readCachedSymbolChanges(): string {
    const file = path.join(CACHE_DIR, 'symbolchange.csv');
    return existsSync(file) ? readFileSync(file, 'latin1') : '';
}

function listCached(kind: 'bhav' | 'bc', pattern: RegExp): string[] {
    const root = path.join(CACHE_DIR, kind);
    if (!existsSync(root)) return [];
    const days: string[] = [];
    for (const y of readdirSync(root).sort()) {
        for (const f of readdirSync(path.join(root, y))) {
            const m = pattern.exec(f);
            if (m) days.push(`${m[1]}-${m[2]}-${m[3]}`);
        }
    }
    return days.sort();
}
