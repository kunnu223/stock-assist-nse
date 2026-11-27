/**
 * Point-in-time liquidity universe at each month-end.
 *
 * Eligible at signal day C: company shares only (ETFs/fund units excluded by ISIN); EQ series on C;
 * close ≥ ₹10; first row ≥ 252 trading days before C;
 * a price on ≥ 90% of the last 252 days. Ranked by the 126-day median daily traded value
 * (days with no trade count as 0).
 *
 * @module @stock-assist/api/services/momentum/universe
 */

import type { Panel } from '../nse/panel';

export interface LiquiditySnapshot {
    /** Panel day index of the signal date C */
    day: number;
    /** Eligible symbol indices, most liquid first */
    ranked: number[];
    /** symbol index → 1-based liquidity rank */
    rankOf: Map<number, number>;
    /** symbol index → 126-day median traded value (₹) */
    medianValue: Map<number, number>;
}

const HISTORY = 252;
const PRESENCE = 0.9;
const LIQ_WINDOW = 126;
const MIN_PRICE = 10;

export function liquiditySnapshots(panel: Panel, monthEnds: number[]): LiquiditySnapshot[] {
    const n = panel.symbols.length;
    // Prefix counts of days with a price, per symbol, for O(1) presence checks
    const present = panel.close.map(c => {
        const p = new Int32Array(c.length + 1);
        for (let d = 0; d < c.length; d++) p[d + 1] = p[d] + (Number.isNaN(c[d]) ? 0 : 1);
        return p;
    });
    const firstDay = panel.close.map(c => c.findIndex(x => !Number.isNaN(x)));
    const buf = new Float64Array(LIQ_WINDOW);

    return monthEnds.map(C => {
        const scored: Array<[number, number]> = [];
        for (let i = 0; i < n; i++) {
            if (!panel.isCompanyShare[i] || panel.series[i][C] !== 1 || !(panel.close[i][C] >= MIN_PRICE)) continue;
            if (firstDay[i] < 0 || C - firstDay[i] < HISTORY) continue;
            if (present[i][C + 1] - present[i][C + 1 - HISTORY] < PRESENCE * HISTORY) continue;
            const v = panel.value[i];
            for (let k = 0; k < LIQ_WINDOW; k++) buf[k] = v[C - k] || 0;
            scored.push([i, medianInPlace(buf)]);
        }
        scored.sort((a, b) => b[1] - a[1]);
        return {
            day: C,
            ranked: scored.map(s => s[0]),
            rankOf: new Map(scored.map((s, r) => [s[0], r + 1])),
            medianValue: new Map(scored),
        };
    });
}

/** Median of a small buffer (sorts it in place). */
function medianInPlace(a: Float64Array): number {
    a.sort();
    const m = a.length >> 1;
    return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}
