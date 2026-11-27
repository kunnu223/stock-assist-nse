/**
 * Download and cache NSE data for the momentum backtest (idempotent; re-run to top up).
 *
 * Phase 1: daily bhavcopies. Phase 2: corporate-action (`Bc`) files for every trading day (--bc-every N to thin)
 * from 2010. Some files list ex-dates only a few days ahead, so thinning can miss events.
 * Requests are paced (NSE_MIN_INTERVAL_MS, default 400 ms) because NSE answers bursts with 403.
 *
 * Usage (from apps/api):
 *   npx tsx scripts/nseSync.ts [--start 2004-01-01] [--end today] [--concurrency 2] [--no-bc] [--isin-backfill]
 */

import { getBhavcopy, getCorporateActionsFile, getSymbolChanges, cachedTradingDays, CACHE_DIR } from '../src/services/nse/archive';
import { syncIndexData } from '../src/services/nse/indices';

const arg = (name: string) => {
    const i = process.argv.indexOf(`--${name}`);
    return i !== -1 ? process.argv[i + 1] : undefined;
};

/** Corporate-action files exist from January 2010 onward. */
const BC_START = '2010-01-01';
/** Every Nth trading day. Some files only list ex-dates a few days ahead, so 1 (every day) is the safe default. */
const BC_EVERY = Number(arg('bc-every') ?? 1);

function weekdays(start: string, end: string): string[] {
    const out: string[] = [];
    for (let t = Date.parse(`${start}T00:00:00Z`); t <= Date.parse(`${end}T00:00:00Z`); t += 86_400_000) {
        const d = new Date(t);
        if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6) out.push(d.toISOString().slice(0, 10));
    }
    return out;
}

async function pool<T>(label: string, items: T[], size: number, fn: (item: T) => Promise<unknown>) {
    let next = 0, done = 0, failures = 0;
    const t0 = Date.now();
    await Promise.all(Array.from({ length: size }, async () => {
        while (next < items.length) {
            const item = items[next++];
            try { await fn(item); } catch (err) {
                failures++;
                console.warn(`  ! ${label} ${String(item)}: ${(err as Error).message}`);
            }
            if (++done % 250 === 0) console.log(`  ${label} ${done}/${items.length} (${Math.round((Date.now() - t0) / 1000)}s)`);
        }
    }));
    return failures;
}

async function main() {
    const start = arg('start') ?? '2004-01-01';
    const end = arg('end') ?? new Date().toISOString().slice(0, 10);
    const concurrency = Number(arg('concurrency') ?? 2);
    const t0 = Date.now();
    console.log(`Cache: ${CACHE_DIR}`);

    let failures = await pool('bhav', weekdays(start, end), concurrency, getBhavcopy);

    if (!process.argv.includes('--no-bc')) {
        const days = cachedTradingDays().filter(d => d >= BC_START && d >= start && d <= end);
        const sample = days.filter((_, i) => i % BC_EVERY === 0 || i === days.length - 1);
        failures += await pool('bc', sample, concurrency, getCorporateActionsFile);
    }

    // One-off: files cached before ISINs were kept are re-fetched weekly from 2010 (first year with ISINs),
    // enough to tag every liquid symbol as company shares (INE…) or fund units/ETFs (INF…)
    if (process.argv.includes('--isin-backfill')) {
        const days = cachedTradingDays().filter(d => d >= BC_START && d >= start && d <= end);
        const weekly = days.filter((_, i) => i % 5 === 0 || i === days.length - 1);
        failures += await pool('isin', weekly, concurrency, d => getBhavcopy(d, true));
    }

    await getSymbolChanges();
    try {
        await syncIndexData();
    } catch (err) {
        console.warn(`  ! index history not refreshed (cached copy kept): ${(err as Error).message}`);
    }
    console.log(`Done: ${cachedTradingDays().length} trading days cached, ${failures} failures, ${Math.round((Date.now() - t0) / 1000)}s`);
    if (failures > 0) process.exitCode = 1;
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
