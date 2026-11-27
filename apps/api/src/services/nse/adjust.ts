/**
 * Corporate-action adjustment of the raw panel.
 *
 * 1. `Bc` events (2010+): split/bonus/consolidation factors are verified against the observed close-to-close
 *    ratio within ±3 trading days of the stated ex-date (within min(25%, half the distance to "no change"));
 *    truncated ratios snap the observed gap to a standard ratio; 'gap' actions (demerger,
 *    rights, capital reduction, scheme) use the ex-date open / previous close when that gap exceeds 3%.
 * 2. Heuristic (any year): a close-to-close drop below 0.72 that matches a standard split ratio at both
 *    the open and the close, with share volume scaling up accordingly, is treated as an unrecorded split.
 * 3. adj[d] = close[d] × product of factors of all events after d.
 *
 * @module @stock-assist/api/services/nse/adjust
 */

import type { Panel } from './panel';
import { nearestStandardRatio, type ActionKind } from './corporateActions';
import type { CorporateActionIndex } from './actionIndex';

export interface PriceEvent { day: number; factor: number; kind: ActionKind; source: 'bc' | 'heuristic' }

export interface AdjustReport {
    bcApplied: number;
    gapApplied: number;
    heuristicApplied: number;
    unverified: Array<{ symbol: string; exDate: string; purposes: string[]; nearestRatio: number | null }>;
}

const MATCH_TOL = Math.log(1.25);
const GAP_MIN = Math.log(1.03);
/** Below this price, one-tick moves (e.g. ₹0.03 → ₹0.02) look like split ratios */
const HEURISTIC_MIN_PRICE = 5;

/** Index of the last close before d within `maxBack` trading days, or -1. */
export function prevCloseIdx(close: Float32Array, d: number, maxBack = 10): number {
    for (let p = d - 1; p >= Math.max(0, d - maxBack); p--) if (!Number.isNaN(close[p])) return p;
    return -1;
}

/** First index with dates[i] >= iso (dates sorted), or dates.length. */
export function firstOnOrAfter(dates: string[], iso: string): number {
    let lo = 0, hi = dates.length;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (dates[mid] < iso) lo = mid + 1; else hi = mid;
    }
    return lo;
}

function ratioAt(panel: Panel, i: number, d: number): number {
    const c = panel.close[i];
    if (d < 0 || d >= c.length || Number.isNaN(c[d])) return NaN;
    const p = prevCloseIdx(c, d);
    return p < 0 ? NaN : c[d] / c[p];
}

/**
 * Candidate unrecorded splits for symbol i: [{day, factor}].
 * The overnight gap (open vs previous close) must sit within 5% of a standard ratio: a gap beyond the
 * normal price bands essentially only happens when NSE resets the base price for a corporate action.
 * The close may drift further (15%) with the day's trading; share volume must scale up with the split.
 */
export function detectHeuristicSplits(panel: Panel, i: number): Array<{ day: number; factor: number }> {
    const { close, open, volume } = { close: panel.close[i], open: panel.open[i], volume: panel.volume[i] };
    const out: Array<{ day: number; factor: number }> = [];
    for (let d = 1; d < close.length; d++) {
        const g = ratioAt(panel, i, d);
        if (!(g < 0.72)) continue;
        const p = prevCloseIdx(close, d);
        if (close[p] < HEURISTIC_MIN_PRICE || !(panel.value[i][d] > 0)) continue;
        const r = nearestStandardRatio(open[d] / close[p], Math.log(1.05));
        if (r === null || Math.abs(Math.log(g / r)) > Math.log(1.15)) continue;
        const before = median(volume.subarray(Math.max(0, p - 19), p + 1));
        const after = median(volume.subarray(d, Math.min(close.length, d + 20)));
        if (before > 0 && after / before >= 0.4 / r) out.push({ day: d, factor: r });
    }
    return out;
}

function median(a: Float32Array): number {
    const v = Array.from(a).filter(x => x > 0).sort((x, y) => x - y);
    return v.length ? v[v.length >> 1] : 0;
}

export function applyCorporateActions(panel: Panel, actions: CorporateActionIndex): AdjustReport {
    const report: AdjustReport = { bcApplied: 0, gapApplied: 0, heuristicApplied: 0, unverified: [] };
    const near = (i: number, d: number) => panel.events[i].some(e => Math.abs(e.day - d) <= 3);

    for (const [symbol, byDate] of actions) {
        const i = panel.index.get(symbol);
        if (i === undefined) continue;
        for (const [exDate, { actions: acts, purposes }] of byDate) {
            const d0 = firstOnOrAfter(panel.dates, exDate);
            if (d0 >= panel.dates.length) continue;
            const priced = acts.filter(a => a.factor !== undefined);
            const unpriced = acts.find(a => (a.kind === 'split' || a.kind === 'bonus') && a.factor === undefined);
            if (priced.length > 0 || unpriced) {
                const product = priced.reduce((x, a) => x * a.factor!, 1);
                const candidates = priced.length > 1 ? [product, ...priced.map(a => a.factor!)] : priced.length ? [product] : [];
                const hit = bestMatch(panel, i, d0, candidates) ?? (unpriced ? snapMatch(panel, i, d0) : null);
                if (hit && !near(i, hit.day)) {
                    panel.events[i].push({ day: hit.day, factor: hit.factor, kind: (priced[0] ?? unpriced)!.kind, source: 'bc' });
                    report.bcApplied++;
                } else if (!hit) {
                    report.unverified.push({ symbol, exDate, purposes, nearestRatio: Number(ratioAt(panel, i, d0).toFixed(3)) || null });
                }
            } else if (acts.some(a => a.kind === 'gap') && !near(i, d0)) {
                const p = prevCloseIdx(panel.close[i], d0);
                const gap = p >= 0 ? panel.open[i][d0] / panel.close[i][p] : NaN;
                if (Number.isFinite(gap) && Math.abs(Math.log(gap)) > GAP_MIN) {
                    panel.events[i].push({ day: d0, factor: gap, kind: 'gap', source: 'bc' });
                    report.gapApplied++;
                }
            }
        }
    }

    for (let i = 0; i < panel.symbols.length; i++) {
        for (const h of detectHeuristicSplits(panel, i)) {
            if (near(i, h.day)) continue;
            panel.events[i].push({ day: h.day, factor: h.factor, kind: 'split', source: 'heuristic' });
            report.heuristicApplied++;
        }
        panel.events[i].sort((a, b) => a.day - b.day);
        computeAdjusted(panel, i);
    }
    return report;
}

/** For a split/bonus whose ratio text was truncated: the ±3-day gap that snaps to a standard ratio. */
function snapMatch(panel: Panel, i: number, d0: number): { day: number; factor: number } | null {
    for (let d = d0; d <= d0 + 3; d++) {
        const p = prevCloseIdx(panel.close[i], d);
        if (p < 0 || Number.isNaN(panel.close[i][d])) continue;
        const r = nearestStandardRatio(panel.open[i][d] / panel.close[i][p], Math.log(1.05));
        if (r !== null && Math.abs(Math.log(ratioAt(panel, i, d) / r)) <= Math.log(1.15)) return { day: d, factor: r };
    }
    return null;
}

function bestMatch(panel: Panel, i: number, d0: number, factors: number[]): { day: number; factor: number } | null {
    let best: { day: number; factor: number; dist: number } | null = null;
    for (const f of factors) {
        // A documented action may move with the day's trading, but must stay closer to f than to "no change"
        const tol = Math.min(MATCH_TOL, 0.5 * Math.abs(Math.log(f)));
        for (let d = d0 - 3; d <= d0 + 3; d++) {
            const dist = Math.abs(Math.log(ratioAt(panel, i, d) / f));
            if (Number.isFinite(dist) && dist <= tol && (!best || dist < best.dist)) best = { day: d, factor: f, dist };
        }
        if (best) break; // prefer the combined factor, then singles in order
    }
    return best && { day: best.day, factor: best.factor };
}

export function computeAdjusted(panel: Panel, i: number): void {
    const { close } = panel;
    const adj = panel.adj[i];
    const ev = panel.events[i];
    let k = ev.length - 1;
    let cum = 1;
    for (let d = close[i].length - 1; d >= 0; d--) {
        adj[d] = close[i][d] * cum;
        while (k >= 0 && ev[k].day === d) cum *= ev[k--].factor;
        while (k >= 0 && ev[k].day > d) k--;
    }
}
