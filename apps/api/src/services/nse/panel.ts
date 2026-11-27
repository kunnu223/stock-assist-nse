/**
 * Point-in-time daily price panel for all NSE equities (including later-delisted ones),
 * built from cached bhavcopies. One continuous series per company (renames chained).
 *
 * Two passes keep memory bounded: pass 1 reads traded value for every symbol and keeps only
 * symbols that ever rank within `maxLiquidityRank` by 126-day mean traded value at a month-end;
 * pass 2 fills OHLC/volume/series for those. Corporate-action adjustment is in ./adjust.
 *
 * @module @stock-assist/api/services/nse/panel
 */

import { cachedTradingDays, readCachedBhavcopy, readCachedSymbolChanges } from './archive';
import { fromCompactCsv, type Series } from './bhavcopy';
import { makeCanonicalizer, parseSymbolChanges } from './symbolChanges';
import type { PriceEvent } from './adjust';

export const SERIES_CODE: Record<Series, number> = { EQ: 1, BE: 2, BZ: 3 };

export interface Panel {
    dates: string[];
    symbols: string[];
    index: Map<string, number>;
    open: Float32Array[];
    close: Float32Array[];
    /** Close adjusted for splits/bonuses/gap actions (filled by ./adjust) */
    adj: Float32Array[];
    value: Float32Array[];
    volume: Float32Array[];
    /** 0 = no row, else SERIES_CODE */
    series: Uint8Array[];
    /** 1 when high === low (single price all day, e.g. locked at a circuit limit) */
    locked: Uint8Array[];
    /** Per symbol, sorted by day (filled by ./adjust) */
    events: PriceEvent[][];
    /** False for fund units/ETFs and other non-company instruments (ISIN not INE…); true when unknown */
    isCompanyShare: boolean[];
}

export interface PanelOptions { start?: string; end?: string; maxLiquidityRank?: number }

const LIQ_WINDOW = 126;

export function monthEndIndices(dates: string[]): number[] {
    const out: number[] = [];
    for (let i = 0; i < dates.length; i++) {
        if (i === dates.length - 1 || dates[i + 1].slice(0, 7) !== dates[i].slice(0, 7)) out.push(i);
    }
    return out;
}

export function loadRawPanel(opts: PanelOptions = {}): Panel {
    const dates = cachedTradingDays().filter(d => (!opts.start || d >= opts.start) && (!opts.end || d <= opts.end));
    const D = dates.length;
    const canonical = makeCanonicalizer(parseSymbolChanges(readCachedSymbolChanges()));
    const dayRows = (d: number) => fromCompactCsv(readCachedBhavcopy(dates[d]));

    // Pass 1: traded value for every symbol
    const valueOf = new Map<string, Float32Array>();
    for (let d = 0; d < D; d++) {
        for (const r of dayRows(d)) {
            const s = canonical(r.symbol, dates[d]);
            let arr = valueOf.get(s);
            if (!arr) { arr = new Float32Array(D); valueOf.set(s, arr); }
            arr[d] += r.value;
        }
    }

    // Keep symbols that ever rank within maxLiquidityRank at a month-end. The universe itself is ranked
    // point-in-time on medians later; this generous pre-filter (mean value, all series) only bounds memory.
    const maxRank = opts.maxLiquidityRank ?? 2500;
    const monthEnds = monthEndIndices(dates);
    const names = [...valueOf.keys()];
    const means = names.map(s => rollingMeanAt(valueOf.get(s)!, monthEnds, LIQ_WINDOW));
    const keep = new Set<string>();
    monthEnds.forEach((_, m) => {
        const ranked = names.map((s, i) => [means[i][m], s] as const).filter(([v]) => v > 0).sort((a, b) => b[0] - a[0]);
        for (const [, s] of ranked.slice(0, maxRank)) keep.add(s);
    });

    const symbols = [...keep].sort();
    const index = new Map(symbols.map((s, i) => [s, i]));
    const nan = () => new Float32Array(D).fill(NaN);
    const panel: Panel = {
        dates, symbols, index,
        open: symbols.map(nan), close: symbols.map(nan), adj: symbols.map(nan),
        value: symbols.map(s => valueOf.get(s)!),
        volume: symbols.map(() => new Float32Array(D)),
        series: symbols.map(() => new Uint8Array(D)),
        locked: symbols.map(() => new Uint8Array(D)),
        events: symbols.map(() => []),
        isCompanyShare: symbols.map(() => true),
    };
    valueOf.clear();

    // Pass 2: prices for kept symbols; prefer EQ over BE over BZ on the same day
    for (let d = 0; d < D; d++) {
        for (const r of dayRows(d)) {
            const i = index.get(canonical(r.symbol, dates[d]));
            if (i === undefined) continue;
            if (r.isin && !r.isin.startsWith('INE')) panel.isCompanyShare[i] = false;
            const code = SERIES_CODE[r.series];
            const cur = panel.series[i][d];
            if (cur !== 0 && cur <= code) continue;
            panel.series[i][d] = code;
            panel.open[i][d] = r.open > 0 ? r.open : r.close;
            panel.close[i][d] = r.close;
            panel.volume[i][d] = r.volume;
            panel.locked[i][d] = r.high === r.low ? 1 : 0;
        }
    }
    return panel;
}

/** Mean of arr over the `window` days ending at each index in `at` (missing days count as 0). */
function rollingMeanAt(arr: Float32Array, at: number[], window: number): Float32Array {
    const out = new Float32Array(at.length);
    let sum = 0, lo = 0, k = 0;
    for (let d = 0; d < arr.length && k < at.length; d++) {
        sum += arr[d];
        if (d - lo + 1 > window) sum -= arr[lo++];
        while (k < at.length && at[k] === d) out[k++] = sum / window;
    }
    return out;
}
