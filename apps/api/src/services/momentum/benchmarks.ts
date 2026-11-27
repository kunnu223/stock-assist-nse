/**
 * Baselines over the same days as a simulation:
 * - Nifty 500 price index, bought once (after-tax: LTCG on the whole gain at the end)
 * - Equal-weight universe: the average daily price return of the top-K liquidity universe as of the
 *   previous month-end, gross of costs (the "average stock")
 *
 * @module @stock-assist/api/services/momentum/benchmarks
 */

import type { Context } from './context';
import { LTCG_EXEMPTION, LTCG_RATE, STCG_RATE } from './tax';

export function indexCurve(ctx: Context, dates: string[], capital: number): number[] {
    const first = ctx.panel.dates.indexOf(dates[0]);
    const base = ctx.index[first];
    return dates.map((_, k) => (capital * ctx.index[first + k]) / base);
}

/** Buy-and-hold value after tax on liquidation at the end. */
export function buyAndHoldAfterTax(start: string, end: string, startValue: number, endValue: number): number {
    const gain = endValue - startValue;
    if (gain <= 0) return endValue;
    const longTerm = Date.parse(end) - Date.parse(start) > 365 * 86_400_000;
    const tax = longTerm ? LTCG_RATE * Math.max(0, gain - LTCG_EXEMPTION) : STCG_RATE * gain;
    return endValue - tax;
}

export function equalWeightUniverseCurve(ctx: Context, K: number, dates: string[], capital: number): number[] {
    const { panel, liq, monthOf } = ctx;
    const first = panel.dates.indexOf(dates[0]);
    const membersAt = (d: number) => (monthOf.has(d) ? liq[monthOf.get(d)!].ranked.slice(0, K) : null);
    let members = membersAt(first) ?? [];
    const out = [capital];
    for (let k = 1; k < dates.length; k++) {
        const d = first + k;
        let sum = 0, n = 0;
        for (const i of members) {
            const a = panel.adj[i];
            if (Number.isNaN(a[d])) continue;
            let p = d - 1;
            while (p > d - 10 && Number.isNaN(a[p])) p--;
            if (Number.isNaN(a[p])) continue;
            sum += a[d] / a[p] - 1;
            n++;
        }
        out.push(out[k - 1] * (1 + (n ? sum / n : 0)));
        members = membersAt(d) ?? members;
    }
    return out;
}
