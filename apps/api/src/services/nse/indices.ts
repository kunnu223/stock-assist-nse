/**
 * Index history (niftyindices.com) and the monthly risk-free rate (IIMA data library), cached on disk.
 *
 * niftyindices exposes the data behind its "Historical Data" page as an undocumented POST endpoint;
 * one call returns the full daily history of a price index.
 *
 * @module @stock-assist/api/services/nse/indices
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { CACHE_DIR, fetchBuffer } from './archive';

export const INDEX_NAMES = ['NIFTY 500', 'NIFTY 50', 'NIFTY200 MOMENTUM 30'] as const;
export type IndexName = (typeof INDEX_NAMES)[number];

const NIFTY_URL = 'https://www.niftyindices.com/BackPage/getHistoricaldatatabletoString';
const IIMA_URL = 'https://faculty.iima.ac.in/iffm/Indian-Fama-French-Momentum/DATA/2025-12_FourFactors_and_Market_Returns_Monthly_SurvivorshipBiasAdjusted.csv';
const MONTHS: Record<string, string> = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };

export interface IndexSeries { dates: string[]; close: number[] }

const indexFile = (name: IndexName) => path.join(CACHE_DIR, 'index', `${name.replace(/\s+/g, '_')}.json`);
const rfFile = () => path.join(CACHE_DIR, 'iima_monthly.csv');

/** '29 Sep 2026' → '2026-09-29' */
export function parseNiftyDate(s: string): string {
    const [d, m, y] = s.trim().split(/\s+/);
    return `${y}-${MONTHS[m]}-${d.padStart(2, '0')}`;
}

async function fetchIndex(name: IndexName, start = '01-Jan-2004'): Promise<IndexSeries> {
    const end = new Date().toUTCString().split(' ').slice(1, 4).join('-'); // e.g. 29-Sep-2026
    const cinfo = `{'name':'${name}','startDate':'${start}','endDate':'${end}','indexName':'${name}'}`;
    const res = await fetch(NIFTY_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64)',
            Origin: 'https://www.niftyindices.com',
            Referer: 'https://www.niftyindices.com/reports/historical-data',
        },
        body: JSON.stringify({ cinfo }),
        signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) throw new Error(`niftyindices ${name}: HTTP ${res.status}`);
    const body = await res.json() as unknown;
    const rows = (Array.isArray(body) ? body : JSON.parse((body as { d: string }).d)) as Array<Record<string, string>>;
    const points = rows
        .map(r => ({ date: parseNiftyDate(r.HistoricalDate), close: Number(r.CLOSE) }))
        .filter(p => Number.isFinite(p.close) && p.close > 0)
        .sort((a, b) => a.date.localeCompare(b.date));
    return { dates: points.map(p => p.date), close: points.map(p => p.close) };
}

export async function syncIndexData(): Promise<void> {
    mkdirSync(path.join(CACHE_DIR, 'index'), { recursive: true });
    for (const name of INDEX_NAMES) {
        const series = await fetchIndex(name);
        writeFileSync(indexFile(name), JSON.stringify(series));
        console.log(`  index ${name}: ${series.dates.length} days ${series.dates[0]} → ${series.dates.at(-1)}`);
    }
    const buf = await fetchBuffer(IIMA_URL);
    if (buf) writeFileSync(rfFile(), buf);
}

export function loadIndex(name: IndexName): IndexSeries {
    const file = indexFile(name);
    if (!existsSync(file)) throw new Error(`Index ${name} not cached. Run scripts/nseSync.ts`);
    return JSON.parse(readFileSync(file, 'utf8')) as IndexSeries;
}

/** Monthly risk-free return in percent, keyed 'YYYY-MM' (IIMA T-bill series). */
export function loadRiskFreeMonthly(): Map<string, number> {
    const out = new Map<string, number>();
    if (!existsSync(rfFile())) return out;
    const lines = readFileSync(rfFile(), 'utf8').split(/\r?\n/);
    const header = lines[0].split(',');
    const iDate = header.indexOf('Date');
    const iRf = header.indexOf('RF');
    for (const line of lines.slice(1)) {
        const f = line.split(',');
        const rf = Number(f[iRf]);
        if (f[iDate] && Number.isFinite(rf)) out.set(f[iDate].trim(), rf);
    }
    return out;
}
