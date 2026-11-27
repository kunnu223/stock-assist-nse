/**
 * Indian capital-gains tax on listed shares, current rules applied to every year:
 * STCG (held ≤ 12 months) 20% + 4% cess; LTCG 12.5% + cess above ₹1.25 lakh per financial year.
 * Short-term losses offset any gain; long-term losses only long-term gains; losses carry forward 8 years.
 *
 * @module @stock-assist/api/services/momentum/tax
 */

import type { Realized } from './book';

export const STCG_RATE = 0.2 * 1.04;
export const LTCG_RATE = 0.125 * 1.04;
export const LTCG_EXEMPTION = 125_000;
const CARRY_YEARS = 8;

export interface FyTax { fy: number; shortTerm: number; longTerm: number; tax: number }

/** Financial year label = the calendar year in which it starts (April). */
export const fyOf = (iso: string) => (Number(iso.slice(5, 7)) >= 4 ? Number(iso.slice(0, 4)) : Number(iso.slice(0, 4)) - 1);

export function computeTaxes(realized: Realized[]): FyTax[] {
    const byFy = new Map<number, { st: number; lt: number }>();
    for (const r of realized) {
        const fy = fyOf(r.date);
        const e = byFy.get(fy) ?? { st: 0, lt: 0 };
        if (r.longTerm) e.lt += r.gain; else e.st += r.gain;
        byFy.set(fy, e);
    }
    const carried: Array<{ fy: number; amount: number; longTerm: boolean }> = [];
    const out: FyTax[] = [];

    for (const fy of [...byFy.keys()].sort((a, b) => a - b)) {
        let { st, lt } = byFy.get(fy)!;
        const shortTerm = st, longTerm = lt;
        // Same-year set-off: a short-term loss may absorb long-term gains
        if (st < 0 && lt > 0) { const x = Math.min(-st, lt); st += x; lt -= x; }
        // Brought-forward losses, oldest first; expired ones are dropped
        for (const c of carried) {
            if (fy - c.fy > CARRY_YEARS || c.amount <= 0) continue;
            if (!c.longTerm && st > 0) { const x = Math.min(c.amount, st); st -= x; c.amount -= x; }
            if (lt > 0) { const x = Math.min(c.amount, lt); lt -= x; c.amount -= x; }
        }
        if (st < 0) { carried.push({ fy, amount: -st, longTerm: false }); st = 0; }
        if (lt < 0) { carried.push({ fy, amount: -lt, longTerm: true }); lt = 0; }
        const tax = STCG_RATE * st + LTCG_RATE * Math.max(0, lt - LTCG_EXEMPTION);
        out.push({ fy, shortTerm, longTerm, tax });
    }
    return out;
}

/**
 * Post-tax equity curve: each financial year's tax is withdrawn on its last trading day
 * (on or before 31 March), scaling everything after it by (1 − tax / equity).
 * `finalTax` (tax on an assumed liquidation at the end) is deducted from the last value.
 */
export function afterTaxCurve(dates: string[], equity: number[], taxes: FyTax[], finalTax = 0): number[] {
    const n = dates.length;
    const at = new Map<number, number>();
    let atEnd = finalTax;
    for (const t of taxes) {
        const limit = `${t.fy + 1}-03-31`;
        if (n === 0 || dates[n - 1] <= limit) { atEnd += t.tax; continue; } // year not over within the data
        let k = n - 1;
        while (k > 0 && dates[k] > limit) k--;
        at.set(k, (at.get(k) ?? 0) + t.tax);
    }
    const out: number[] = [];
    let scale = 1;
    for (let k = 0; k < n; k++) {
        const tax = at.get(k);
        if (tax) scale *= Math.max(0, 1 - tax / equity[k]);
        out.push(equity[k] * scale);
    }
    if (n) out[n - 1] -= atEnd * scale;
    return out;
}
