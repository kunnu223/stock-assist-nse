/**
 * NSE normalised momentum score (Nifty200 Momentum 30 method, no skip-month):
 *   R12 = P(C)/P(C−12m) − 1, R6 = P(C)/P(C−6m) − 1 (month-end adjusted closes)
 *   σ   = sample SD of the last 252 daily log returns × √252 (≥ 200 returns required)
 *   Z   = ½·z(R6/σ) + ½·z(R12/σ), z-scores across the top-K liquidity universe
 *   NMS = 1 + Z if Z ≥ 0, else 1 / (1 − Z)
 *
 * @module @stock-assist/api/services/momentum/score
 */

import type { Panel } from '../nse/panel';
import type { LiquiditySnapshot } from './universe';

export interface ScoreSnapshot {
    /** Top-K universe symbols with a score, best first */
    ranked: number[];
    /** symbol → NMS, for the top-K and for names in the 1.5K extension (so holdings can be ranked) */
    nms: Map<number, number>;
}

export const nmsTransform = (z: number) => (z >= 0 ? 1 + z : 1 / (1 - z));

/** Annualised volatility floor for a scorable stock */
const MIN_VOL = 0.05;

/** Last valid adjusted close at or up to 10 days before d. */
function priceAt(adj: Float32Array, d: number): number {
    for (let k = d; k >= Math.max(0, d - 10); k--) if (!Number.isNaN(adj[k])) return adj[k];
    return NaN;
}

export function annualisedVol(adj: Float32Array, end: number, window = 252, minReturns = 200): number {
    let n = 0, sum = 0, sumSq = 0, prev = NaN;
    for (let d = end - window; d <= end; d++) {
        const p = adj[d];
        if (Number.isNaN(p)) continue;
        if (!Number.isNaN(prev)) {
            const r = Math.log(p / prev);
            n++; sum += r; sumSq += r * r;
        }
        prev = p;
    }
    if (n < minReturns) return NaN;
    const variance = (sumSq - (sum * sum) / n) / (n - 1);
    return Math.sqrt(variance * 252);
}

/**
 * @param m index into monthEnds of the signal date (needs m ≥ 12)
 */
export function momentumScores(panel: Panel, liq: LiquiditySnapshot, monthEnds: number[], m: number, K: number): ScoreSnapshot {
    const [C, C6, C12] = [monthEnds[m], monthEnds[m - 6], monthEnds[m - 12]];
    const candidates = liq.ranked.slice(0, Math.ceil(1.5 * K));
    const raw: Array<{ i: number; mr6: number; mr12: number; core: boolean }> = [];
    candidates.forEach((i, pos) => {
        const adj = panel.adj[i];
        const p0 = priceAt(adj, C), p6 = priceAt(adj, C6), p12 = priceAt(adj, C12);
        const vol = annualisedVol(adj, C);
        // No company share is this calm; such series are money-market/debt instruments that slipped through
        if (![p0, p6, p12, vol].every(Number.isFinite) || vol < MIN_VOL) return;
        raw.push({ i, mr6: (p0 / p6 - 1) / vol, mr12: (p0 / p12 - 1) / vol, core: pos < K });
    });

    const core = raw.filter(r => r.core);
    const stats = (xs: number[]) => {
        const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
        const sd = Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, xs.length - 1));
        return { mean, sd: sd || 1 };
    };
    const s6 = stats(core.map(r => r.mr6));
    const s12 = stats(core.map(r => r.mr12));

    const nms = new Map<number, number>();
    for (const r of raw) {
        const z = 0.5 * ((r.mr6 - s6.mean) / s6.sd) + 0.5 * ((r.mr12 - s12.mean) / s12.sd);
        nms.set(r.i, nmsTransform(z));
    }
    const ranked = core.map(r => r.i).sort((a, b) => nms.get(b)! - nms.get(a)!);
    return { ranked, nms };
}

/** 1-based rank of any scored symbol against the top-K list (extension names slot in by score). */
export function rankAgainst(snap: ScoreSnapshot, i: number): number {
    const s = snap.nms.get(i);
    if (s === undefined) return Infinity;
    const pos = snap.ranked.indexOf(i);
    if (pos >= 0) return pos + 1;
    let better = 0;
    for (const j of snap.ranked) if (snap.nms.get(j)! > s) better++; else break;
    return better + 1;
}
