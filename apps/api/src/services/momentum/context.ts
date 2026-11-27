/**
 * Everything the simulator needs that does not depend on the variant, computed once:
 * month-ends, liquidity snapshots, momentum scores per universe size K, the Nifty 500 trend
 * filter, daily cash yield, and corporate-action events by day.
 *
 * @module @stock-assist/api/services/momentum/context
 */

import { monthEndIndices, type Panel } from '../nse/panel';
import type { IndexSeries } from '../nse/indices';
import { liquiditySnapshots, type LiquiditySnapshot } from './universe';
import { momentumScores, type ScoreSnapshot } from './score';

export interface Context {
    panel: Panel;
    monthEnds: number[];
    /** panel day → index into monthEnds, for month-end days */
    monthOf: Map<number, number>;
    liq: LiquiditySnapshot[];
    /** Trend filter per month-end: Nifty 500 close ≥ its 10-month SMA */
    riskOn: boolean[];
    /** Nifty 500 close aligned to panel days (last value on or before) */
    index: Float64Array;
    /** Cash return per panel day */
    rfDaily: Float64Array;
    eventsByDay: Map<number, Array<{ i: number; factor: number }>>;
    scores: Map<number, Array<ScoreSnapshot | null>>;
}

export function alignSeries(dates: string[], series: IndexSeries): Float64Array {
    const out = new Float64Array(dates.length).fill(NaN);
    let j = 0, last = NaN;
    for (let d = 0; d < dates.length; d++) {
        while (j < series.dates.length && series.dates[j] <= dates[d]) last = series.close[j++];
        out[d] = last;
    }
    return out;
}

export function buildContext(panel: Panel, nifty500: IndexSeries, rfMonthlyPct: Map<string, number>): Context {
    const monthEnds = monthEndIndices(panel.dates);
    const index = alignSeries(panel.dates, nifty500);
    const riskOn = monthEnds.map((d, m) => {
        if (m < 9) return true;
        const closes = monthEnds.slice(m - 9, m + 1).map(x => index[x]);
        const sma = closes.reduce((a, b) => a + b, 0) / closes.length;
        return !(index[d] < sma);
    });

    // Monthly T-bill return spread evenly over that month's trading days; last value carried forward
    const rfDaily = new Float64Array(panel.dates.length);
    const daysInMonth = new Map<string, number>();
    for (const d of panel.dates) daysInMonth.set(d.slice(0, 7), (daysInMonth.get(d.slice(0, 7)) ?? 0) + 1);
    let lastRf = 0;
    panel.dates.forEach((date, d) => {
        const ym = date.slice(0, 7);
        lastRf = rfMonthlyPct.get(ym) ?? lastRf;
        rfDaily[d] = (1 + lastRf / 100) ** (1 / daysInMonth.get(ym)!) - 1;
    });

    const eventsByDay = new Map<number, Array<{ i: number; factor: number }>>();
    panel.events.forEach((evs, i) => {
        for (const e of evs) {
            const list = eventsByDay.get(e.day) ?? [];
            list.push({ i, factor: e.factor });
            eventsByDay.set(e.day, list);
        }
    });

    return {
        panel, monthEnds,
        monthOf: new Map(monthEnds.map((d, m) => [d, m])),
        liq: liquiditySnapshots(panel, monthEnds),
        riskOn, index, rfDaily, eventsByDay,
        scores: new Map(),
    };
}

/** Momentum score snapshots for universe size K at every month-end (null before 12 months of history). */
export function scoresFor(ctx: Context, K: number): Array<ScoreSnapshot | null> {
    let s = ctx.scores.get(K);
    if (!s) {
        s = ctx.monthEnds.map((_, m) => (m < 12 ? null : momentumScores(ctx.panel, ctx.liq[m], ctx.monthEnds, m, K)));
        ctx.scores.set(K, s);
    }
    return s;
}

/** Same eligible names as the momentum snapshot, ranked at random (for the random-portfolio baseline). */
export function randomSnapshot(snap: ScoreSnapshot, rand: () => number): ScoreSnapshot {
    const nms = new Map<number, number>();
    for (const i of snap.nms.keys()) nms.set(i, rand());
    return { ranked: [...snap.ranked].sort((a, b) => nms.get(b)! - nms.get(a)!), nms };
}

/** Deterministic PRNG (mulberry32). */
export function mulberry32(seed: number): () => number {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
